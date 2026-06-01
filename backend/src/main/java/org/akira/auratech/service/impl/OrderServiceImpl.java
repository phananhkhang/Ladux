package org.akira.auratech.service.impl;


import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CouponRedemptionResult;
import org.akira.auratech.dto.LineDraft;
import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.response.OrderResponse;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.*;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.repository.*;
import org.akira.auratech.service.CouponRedemptionService;
import org.akira.auratech.service.InventoryService;
import org.akira.auratech.service.OrderService;
import org.akira.auratech.service.OrderStateMachine;
import org.akira.auratech.service.PaymentAttemptService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository repo;
    private final UserRepository userRepository;
    private final InventoryService inventoryService;
    private final CouponRedemptionService couponRedemptionService;
    private final PaymentAttemptService paymentAttemptService;
    private final OrderStateMachine orderStateMachine;

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        // Lấy toàn bộ đơn hàng và chuyển sang DTO để trả về cho API.
        return repo.findAll(pageable)
                .map(OrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(int userId, int orderId) {
        // Lấy đơn hàng kèm danh sách item để phục vụ kiểm tra quyền và hiển thị chi tiết.
        Order order = repo.findWithItemsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

          // Chỉ chủ đơn mới được xem đơn hàng của mình.
          if (!order.getUser().getId().equals(userId)) {
            throw new BusinessRuleException("Bạn không có quyền xem đơn hàng này!");
        }
        return OrderResponse.fromEntity(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUserId(int userId, Pageable pageable) {
        // Trả về danh sách đơn hàng của đúng người dùng được yêu cầu.
        return repo.findByUserId(userId, pageable)
                .map(OrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        // Lọc đơn hàng theo trạng thái để phục vụ thống kê hoặc tra cứu.
        return repo.findByStatus(status, pageable)
                .map(OrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional
    public OrderResponse createOrder(int userId, OrderRequest request) {
        // B1: kiểm tra user tồn tại hay không.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));

        // B2: chỉ cho phép đặt hàng nếu tài khoản còn hoạt động.
        if (!user.isActive()) {
            throw new BusinessRuleException("Tai khoan dang bi khoa, khong the dat hang");
        }

        // B3: khóa tồn kho từng sản phẩm, kiểm tra đủ số lượng, đồng thời tính giá tại thời điểm mua.
        List<LineDraft> lineDrafts = inventoryService.reserveStockAndPriceLines(request.items());

        // B4: cộng tổng tiền trước khi giảm giá.
        BigDecimal subTotal = lineDrafts.stream()
                .map(LineDraft::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        CouponRedemptionResult redemption = couponRedemptionService.redeem(request.couponId(), subTotal);
        Coupon coupon = redemption.coupon();
        BigDecimal discountAmount = redemption.discountAmount();

        // B6: tính số tiền cuối cùng sau khi trừ giảm giá, đảm bảo không âm.
        BigDecimal finalAmount = subTotal.subtract(discountAmount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        Order order = Order.builder()
                .coupon(coupon)
                .subTotal(subTotal)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.shippingAddress())
                .user(user)
                .build();

        // B8: thêm các dòng sản phẩm vào đơn hàng.
        for (LineDraft draft : lineDrafts) {
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .product(draft.product())
                    .quantity(draft.quantity())
                    .priceAtPurchase(draft.priceAtPurchase())
                    .build());
        }

        // B9: ghi lại lịch sử khởi tạo đơn để audit sau này.
        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .status(OrderStatus.PENDING.name())
                .description("Order created")
                .build());

        // B10: tạo payment ban đầu và set hạn thanh toán.
        paymentAttemptService.initializePayment(order, request.paymentProvider(), finalAmount);

        return OrderResponse.fromEntity(repo.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request) {
        return orderStateMachine.updateOrderStatus(orderId, request);
    }

    @Override
    @Transactional
    public int expirePendingOrders() {
        return orderStateMachine.expirePendingOrders();
    }

    @Override
    @Transactional
    public PaymentCallbackResponse retryPayment(int userId, int orderId) {
        return paymentAttemptService.retryPayment(userId, orderId);
    }
}
