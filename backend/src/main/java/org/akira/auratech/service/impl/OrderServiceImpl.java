package org.akira.auratech.service.impl;


import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.LineDraft;
import org.akira.auratech.dto.request.OrderLineRequest;
import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.response.OrderResponse;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.*;
import org.akira.auratech.model.enums.DiscountType;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.model.enums.PaymentProvider;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.repository.*;
import org.akira.auratech.service.OrderLifecycleService;
import org.akira.auratech.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    // Hằng số dùng để tính phần trăm giảm giá.
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final Duration PAYMENT_TIMEOUT = Duration.ofMinutes(15);

    // Repository thao tác với dữ liệu đơn hàng.
    private final OrderRepository repo;
    // Dùng để kiểm tra trạng thái tài khoản người dùng trước khi đặt hàng.
    private final UserRepository userRepository;
    // Dùng để tra coupon và cập nhật số lần sử dụng.
    private final CouponRepository couponRepository;
    // Dùng để khóa và trừ tồn kho sản phẩm khi tạo đơn.
    private final ProductRepository productRepository;
    // Dùng để tạo lại giao dịch thanh toán khi retry payment.
    private final PaymentRepository paymentRepository;
    private final OrderLifecycleService orderLifecycleService;

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
        List<LineDraft> lineDrafts = reserveStockAndPriceLines(request.items());

        // B4: cộng tổng tiền trước khi giảm giá.
        BigDecimal subTotal = lineDrafts.stream()
                .map(LineDraft::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        // B5: nếu có coupon thì kiểm tra hợp lệ và tính số tiền giảm.
        Coupon coupon = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.couponId() != null) {
            // Tìm coupon theo mã và khóa bản ghi để tránh race condition khi tăng lượt dùng.
            coupon = couponRepository.findByCodeForUpdate(request.couponId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + request.couponId()));

            // Xác thực hạn dùng, số lượt, và giá trị tối thiểu của đơn.
            validateCoupon(coupon, subTotal);

            // Tính số tiền giảm thực tế.
            discountAmount = calculateDiscount(coupon, subTotal);

            // Tăng số lượt đã dùng vì coupon đã được áp dụng cho đơn này.
            coupon.setUsedCount(coupon.getUsedCount() + 1);
        }

        // B6: tính số tiền cuối cùng sau khi trừ giảm giá, đảm bảo không âm.
        BigDecimal finalAmount = subTotal.subtract(discountAmount)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        // B7: khởi tạo đơn hàng chính với toàn bộ thông tin nền.
        Order order = Order.builder()
                .coupon(coupon)
                .subTotal(subTotal)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.shippingAddress())
                .paymentExpiresAt(paymentExpiresAt(request.paymentProvider()))
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

        // B10: tạo payment ban đầu ở trạng thái PENDING.
        order.getPayments().add(Payment.builder()
                .order(order)
                .provider(request.paymentProvider())
                .amount(finalAmount)
                .status(PaymentStatus.PENDING)
                .build());

        // Lưu đơn hàng một lần duy nhất; các entity con sẽ được lưu theo cascade nếu cấu hình đúng.
        return OrderResponse.fromEntity(repo.save(order));
    }

    // Khóa sản phẩm theo từng dòng đặt hàng, kiểm tra tồn kho và chuẩn bị dữ liệu tính tiền.
    private List<LineDraft> reserveStockAndPriceLines(List<OrderLineRequest> items) {
        List<LineDraft> drafts = new ArrayList<>();

        for (var item : items) {
            // Khóa sản phẩm để tránh nhiều đơn cùng trừ một lượng tồn kho đồng thời.
            Product product = productRepository.findByIdForUpdate(item.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với id = " + item.productId()));

            // Nếu tồn kho không đủ thì dừng ngay và báo lỗi nghiệp vụ.
            if (product.getStockQuantity() < item.quantity()) {
                throw new BusinessRuleException("Sản phẩm " + product.getName() + " không đủ tồn kho");
            }

            // Trừ tồn kho ngay trong transaction hiện tại.
            product.setStockQuantity(product.getStockQuantity() - item.quantity());

            // Lấy giá đang bán của sản phẩm: giá giảm nếu có, ngược lại dùng giá gốc.
            BigDecimal price = sellingPrice(product);
            // Tính thành tiền của riêng dòng sản phẩm này.
            BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(item.quantity()));

            // Ghi lại “bản nháp” để dùng cho tổng tiền và tạo order item.
            drafts.add(new LineDraft(product, item.quantity(), price, lineTotal));
        }
        return drafts;
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(int orderId, OrderStatusUpdateRequest request) {
        // Lấy đơn hàng và khóa để cập nhật trạng thái an toàn.
        Order order = repo.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));

        // Kiểm tra trạng thái hiện tại và trạng thái muốn chuyển sang.
        OrderStatus current = order.getStatus();
        OrderStatus target = request.status();
        if (current == target) {
            return OrderResponse.fromEntity(order);
        }

        // Chỉ cho phép chuyển trạng thái theo luồng hợp lệ.
        validateTransition(current, target);
        if (target == OrderStatus.CANCELLED) {
            // Nếu hủy đơn thì trả lại tồn kho và hoàn tác coupon.
            orderLifecycleService.cancelOrder(order, "Order cancelled by user");
            return OrderResponse.fromEntity(order);
        }
        if (target == OrderStatus.SHIPPED) {
            // Khi chuyển sang SHIPPED thì tracking number là bắt buộc.
            if (request.trackingNumber() == null || request.trackingNumber().isBlank()) {
                throw new BusinessRuleException("TrackingNumber bat buoc khi chuyen sang SHIPPED");
            }
            order.setTrackingNumber(request.trackingNumber());
        }

        // Cập nhật trạng thái mới và ghi lịch sử thay đổi.
        order.setStatus(target);
        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .status(target.name())
                .description("Order status changed from " + current.name() + " to " + target.name())
                .build());
        return OrderResponse.fromEntity(order);
    }

    @Override
    @Scheduled(fixedDelayString = "${auratech.order-expiration.fixed-delay-ms:60000}")
    @Transactional
    public int expirePendingOrders() {
        List<Order> expiredOrders = repo.findExpiredOrdersForUpdate(OrderStatus.PENDING, Instant.now());
        for (Order order : expiredOrders) {
            orderLifecycleService.cancelOrder(order, "Payment window expired");
        }
        return expiredOrders.size();
    }

    @Override
    @Transactional
    public PaymentCallbackResponse retryPayment(int userId, int orderId) {
        // Khóa đơn hàng để tránh tạo nhiều lượt retry cùng lúc.
        Order order = repo.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + orderId));

        // Không cho retry nếu đơn đã hủy hoặc đã giao.
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Don hang khong con o trang thai co the thanh toan lai");
        }

        // Chỉ chủ đơn hàng mới được retry thanh toán.
        if (order.getUser().getId() != userId) {
            throw new BusinessRuleException("Khong the thu lai thanh toan cho don hang cua nguoi khac");
        }

        // Lấy lần thanh toán gần nhất để kiểm tra có đủ điều kiện retry hay không.
        Payment lastPayment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new BusinessRuleException("Don hang chua co lan thanh toan nao de thu lai"));

        // Chỉ retry khi lần thanh toán gần nhất bị FAIL.
        if (lastPayment.getStatus() != PaymentStatus.FAILED) {
            throw new BusinessRuleException("Chi co the thanh toan lai khi lan thanh toan gan nhat FAILED");
        }

        // Tạo payment mới với cùng số tiền và provider cũ.
        Payment retry = Payment.builder()
                .order(order)
                .amount(order.getFinalAmount())
                .status(PaymentStatus.PENDING)
                .provider(lastPayment.getProvider())
                .build();
        return PaymentCallbackResponse.fromEntity(paymentRepository.save(retry));
    }

    // Trả về giá bán đang áp dụng của sản phẩm.
    private BigDecimal sellingPrice(Product product) {
        return product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getBasePrice();
    }

    private Instant paymentExpiresAt(PaymentProvider provider) {
        return provider == PaymentProvider.COD ? null : Instant.now().plus(PAYMENT_TIMEOUT);
    }

    // Kiểm tra coupon còn hiệu lực, còn lượt dùng và đơn hàng đạt mức tối thiểu.
    private void validateCoupon(Coupon coupon, BigDecimal subTotal) {
        if (!coupon.getExpiresAt().isAfter(Instant.now())) {
            throw new BusinessRuleException("Coupon da het han");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BusinessRuleException("Coupon da het luot su dung");
        }
        BigDecimal minOrderValue = coupon.getMinOrderValue() == null ? BigDecimal.ZERO : coupon.getMinOrderValue();
        if (subTotal.compareTo(minOrderValue) < 0) {
            throw new BusinessRuleException("Don hang chua dat gia tri toi thieu cua coupon");
        }
    }

    // Tính tiền giảm theo kiểu phần trăm hoặc số tiền cố định.
    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subTotal) {
        BigDecimal discount = coupon.getDiscountType() == DiscountType.PERCENT
                ? subTotal.multiply(coupon.getDiscountValue()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
                : coupon.getDiscountValue();
        return discount.min(subTotal).setScale(2, RoundingMode.HALF_UP);
    }

    // Chỉ cho phép chuyển trạng thái theo đúng vòng đời nghiệp vụ của đơn hàng.
    private void validateTransition(OrderStatus current, OrderStatus target) {
        if (current == OrderStatus.CANCELLED || current == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Don hang o trang thai " + current + " khong the chuyen trang thai");
        }
        if (target == OrderStatus.CANCELLED) {
            if (current == OrderStatus.PENDING || current == OrderStatus.CONFIRMED) {
                return;
            }
            throw new BusinessRuleException("Chi huy don khi don dang PENDING hoac CONFIRMED");
        }
        boolean allowed = (current == OrderStatus.PENDING && target == OrderStatus.CONFIRMED)
                || (current == OrderStatus.CONFIRMED && target == OrderStatus.SHIPPED)
                || (current == OrderStatus.SHIPPED && target == OrderStatus.DELIVERED);
        if (!allowed) {
            throw new BusinessRuleException("Trang thai don hang khong duoc nhay coc tu " + current + " sang " + target);
        }
    }
}
