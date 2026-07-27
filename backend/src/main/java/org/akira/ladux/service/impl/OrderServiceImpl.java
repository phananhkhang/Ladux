package org.akira.ladux.service.impl;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.akira.ladux.dto.CouponRedemptionResult;
import org.akira.ladux.dto.LineDraft;
import org.akira.ladux.dto.request.OrderLineRequest;
import org.akira.ladux.dto.request.OrderRequest;
import org.akira.ladux.dto.request.OrderStatusUpdateRequest;
import org.akira.ladux.dto.response.OrderResponse;
import org.akira.ladux.dto.response.PaymentCallbackResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.*;
import org.akira.ladux.model.enums.OrderStatus;
import org.akira.ladux.model.enums.StockMovementType;
import org.akira.ladux.model.enums.StockReferenceType;
import org.akira.ladux.repository.CartRepository;
import org.akira.ladux.repository.OrderRepository;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.CouponRedemptionService;
import org.akira.ladux.service.InventoryService;
import org.akira.ladux.service.OrderService;
import org.akira.ladux.service.OrderStateMachine;
import org.akira.ladux.service.PaymentAttemptService;
import org.akira.ladux.service.StockMovementService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

// Trung tam luong checkout — tao don tu gio hang.
// Luong createOrder (mot transaction):
//   1. Kiem tra user active
//   2. Lay cart co khoa (FOR UPDATE)
//   3. Tru kho atomic + chot gia (InventoryService)
//   4. Redeem coupon (CouponRedemptionService)
//   5. Tao Order PENDING + OrderItem + OrderHistory
//   6. Khoi tao Payment PENDING (PaymentAttemptService)
//   7. Ghi so cai SALE_OUT (StockMovementService.recordLedgerEntry)
//   8. Don sach gio hang
// Chong IDOR: getOrderById doi chieu order.user.id == userId.
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository repo;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final InventoryService inventoryService;
    private final CouponRedemptionService couponRedemptionService;
    private final PaymentAttemptService paymentAttemptService;
    private final OrderStateMachine orderStateMachine;
    private final StockMovementService stockMovementService;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orders", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        // Lấy toàn bộ đơn hàng và chuyển sang DTO để trả về cho API.
        return repo.findAll(pageable)
                .map(OrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orders", key = "'user:' + #userId + ':order:' + #orderId")
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
    @Cacheable(value = "orders", key = "'user:' + #userId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<OrderResponse> getOrdersByUserId(int userId, Pageable pageable) {
        // Trả về danh sách đơn hàng của đúng người dùng được yêu cầu.
        return repo.findByUserId(userId, pageable)
                .map(OrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "orders", key = "'status:' + #status + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        // Lọc đơn hàng theo trạng thái để phục vụ thống kê hoặc tra cứu.
        return repo.findByStatus(status, pageable)
                .map(OrderResponse::summaryFromEntity);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "orderItems", allEntries = true),
            @CacheEvict(value = "orderHistories", allEntries = true),
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "coupons", allEntries = true),
            @CacheEvict(value = "carts", allEntries = true)
    })
    public OrderResponse createOrder(int userId, OrderRequest request) {
        // B1: kiểm tra user tồn tại hay không.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));

        // B2: chỉ cho phép đặt hàng nếu tài khoản còn hoạt động.
        if (!user.isActive()) {
            throw new BusinessRuleException("Tai khoan dang bi khoa, khong the dat hang");
        }

        // B3: lấy giỏ hàng của user (kèm khóa để tránh race), bắt buộc phải có hàng.
        Cart cart = cartRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new BusinessRuleException("Gio hang trong, khong the tao don hang"));
        if (cart.getItems().isEmpty()) {
            throw new BusinessRuleException("Gio hang trong, khong the tao don hang");
        }

        // B4: ánh xạ từng item trong giỏ thành dòng đặt hàng (user không cần nhập tay).
        List<OrderLineRequest> lineRequests = cart.getItems().stream()
                .map(item -> new OrderLineRequest(item.getProduct().getId(), item.getQuantity()))
                .toList();

        // B5: khóa tồn kho từng sản phẩm, kiểm tra đủ số lượng, đồng thời tính giá tại thời điểm mua.
        List<LineDraft> lineDrafts = inventoryService.reserveStockAndPriceLines(lineRequests);

        // B6: cộng tổng tiền trước khi giảm giá.
        BigDecimal subTotal = lineDrafts.stream()
                .map(LineDraft::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        CouponRedemptionResult redemption = couponRedemptionService.redeem(request.couponCode(), subTotal);
        Coupon coupon = redemption.coupon();
        BigDecimal discountAmount = redemption.discountAmount();

        // B7: tính số tiền cuối cùng sau khi trừ giảm giá, đảm bảo không âm.
        BigDecimal finalAmount = subTotal.subtract(discountAmount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);
        ShippingAddress shippingAddress = ShippingAddress.builder()
                .receiverName(request.shippingAddress().receiverName())
                .phone(request.shippingAddress().phone())
                .street(request.shippingAddress().street())
                .ward(request.shippingAddress().ward())
                .district(request.shippingAddress().district())
                .city(request.shippingAddress().city())
                .build();
        Order order = Order.builder()
                .coupon(coupon)
                .subTotal(subTotal)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(OrderStatus.PENDING)
                .shippingAddress(shippingAddress)
                .user(user)
                .build();

        // B8: thêm các dòng sản phẩm vào đơn hàng.
        for (LineDraft draft : lineDrafts) {
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .productVariant(draft.productVariant())
                    .quantity(draft.quantity())
                    .priceAtPurchase(draft.priceAtPurchase())
                    .build());
        }

        // B9: ghi lại lịch sử khởi tạo đơn để audit sau này.
        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .user(order.getUser())
                .status(OrderStatus.PENDING)
                .description("Order created")
                .build());

        // B10: tạo payment ban đầu và set hạn thanh toán.
        paymentAttemptService.initializePayment(order, request.paymentProvider(), finalAmount);

        OrderResponse response = OrderResponse.fromEntity(repo.save(order));

        // B11: ghi so cai bien dong kho (SALE_OUT) cho tung dong — ton kho da bi tru atomic o B5,
        // nen chi GHI SO (recordLedgerEntry) de tranh tru kep. Tham chieu ve don hang vua tao.
        Long orderRef = order.getId().longValue();
        for (LineDraft draft : lineDrafts) {
            stockMovementService.recordLedgerEntry(
                    draft.productVariant(),
                    -draft.quantity(),
                    StockMovementType.SALE_OUT,
                    StockReferenceType.ORDER,
                    orderRef,
                    "Ban hang tu don #" + order.getId(),
                    user);
        }

        // B12: dat hang thanh cong thi don sach gio (orphanRemoval se xoa cart_items khi flush).
        cart.getItems().clear();

        return response;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "orderHistories", allEntries = true)
    })
    public OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request) {
        return orderStateMachine.updateOrderStatus(orderId, request);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "orderHistories", allEntries = true),
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "coupons", allEntries = true)
    })
    public int expirePendingOrders() {
        return orderStateMachine.expirePendingOrders();
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "orders", allEntries = true),
            @CacheEvict(value = "payments", allEntries = true)
    })
    public PaymentCallbackResponse retryPayment(int userId, int orderId) {
        return paymentAttemptService.retryPayment(userId, orderId);
    }
}
