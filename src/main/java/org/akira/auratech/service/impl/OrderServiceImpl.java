package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.OrderLineRequest;
import org.akira.auratech.dto.request.OrderRequest;
import org.akira.auratech.dto.request.OrderStatusUpdateRequest;
import org.akira.auratech.dto.response.OrderResponse;
import org.akira.auratech.dto.response.PaymentCallbackResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.OrderHistory;
import org.akira.auratech.model.OrderItem;
import org.akira.auratech.model.Payment;
import org.akira.auratech.model.Product;
import org.akira.auratech.model.User;
import org.akira.auratech.model.enums.DiscountType;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.model.enums.PaymentStatus;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.repository.OrderRepository;
import org.akira.auratech.repository.PaymentRepository;
import org.akira.auratech.repository.ProductRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final OrderRepository repo;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return repo.findAll().stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(int userId, int orderId) {
        return OrderResponse.fromEntity(repo.findByUserIdAndId(userId, orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + orderId)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(int userId) {
        return repo.findByUserId(userId).stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return repo.findByStatus(status).stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse createOrder(int userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + userId));
        if (!user.isActive()) {
            throw new BusinessRuleException("Tai khoan dang bi khoa, khong the dat hang");
        }

        List<LineDraft> lineDrafts = reserveStockAndPriceLines(request.items());
        BigDecimal subTotal = lineDrafts.stream()
                .map(LineDraft::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        Coupon coupon = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.couponId() != null) {
            coupon = couponRepository.findByIdForUpdate(request.couponId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + request.couponId()));
            validateCoupon(coupon, subTotal);
            discountAmount = calculateDiscount(coupon, subTotal);
            coupon.setUsedCount(coupon.getUsedCount() + 1);
        }
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

        for (LineDraft draft : lineDrafts) {
            order.getItems().add(OrderItem.builder()
                    .order(order)
                    .product(draft.product())
                    .quantity(draft.quantity())
                    .priceAtPurchase(draft.priceAtPurchase())
                    .build());
        }

        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .status(OrderStatus.PENDING.name())
                .description("Order created")
                .build());

        order.getPayments().add(Payment.builder()
                .order(order)
                .provider(request.paymentProvider())
                .amount(finalAmount)
                .status(PaymentStatus.PENDING)
                .build());

        return OrderResponse.fromEntity(repo.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(int userId, int orderId, OrderStatusUpdateRequest request) {
        Order order = repo.findWithItemsById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + orderId));

        OrderStatus current = order.getStatus();
        OrderStatus target = request.status();
        if (current == target) {
            return OrderResponse.fromEntity(order);
        }

        validateTransition(current, target);
        if (target == OrderStatus.CANCELLED) {
            releaseReservedInventory(order);
            rollbackCouponUsage(order);
        }
        if (target == OrderStatus.SHIPPED) {
            if (request.trackingNumber() == null || request.trackingNumber().isBlank()) {
                throw new BusinessRuleException("TrackingNumber bat buoc khi chuyen sang SHIPPED");
            }
            order.setTrackingNumber(request.trackingNumber());
        }

        order.setStatus(target);
        order.getHistories().add(OrderHistory.builder()
                .order(order)
                .status(target.name())
                .description("Order status changed from " + current.name() + " to " + target.name())
                .build());
        return OrderResponse.fromEntity(order);
    }

    @Override
    @Transactional
    public PaymentCallbackResponse retryPayment(int userId, int orderId) {
        Order order = repo.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay order voi id = " + orderId));
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessRuleException("Don hang khong con o trang thai co the thanh toan lai");
        }
        if (order.getUser().getId() != userId) {
            throw new BusinessRuleException("Khong the thu lai thanh toan cho don hang cua nguoi khac");
        }
        Payment lastPayment = paymentRepository.findFirstByOrderIdOrderByCreatedAtDesc(orderId)
                .orElseThrow(() -> new BusinessRuleException("Don hang chua co lan thanh toan nao de thu lai"));
        if (lastPayment.getStatus() != PaymentStatus.FAILED) {
            throw new BusinessRuleException("Chi co the thanh toan lai khi lan thanh toan gan nhat FAILED");
        }

        Payment retry = Payment.builder()
                .order(order)
                .amount(order.getFinalAmount())
                .status(PaymentStatus.PENDING)
                .provider(lastPayment.getProvider())
                .build();
        return PaymentCallbackResponse.fromEntity(paymentRepository.save(retry));
    }

    @Override
    @Transactional
    public void deleteOrderById(int userId, int orderId) {
        throw new BusinessRuleException("Khong xoa truc tiep don hang. Hay chuyen trang thai sang CANCELLED");
    }
    private List<LineDraft> reserveStockAndPriceLines(List<OrderLineRequest> items) {
        Map<Integer, Integer> quantitiesByProduct = new LinkedHashMap<>();
        for (OrderLineRequest item : items) {
            quantitiesByProduct.merge(item.productId(), item.quantity(), Math::addExact);
        }

        List<LineDraft> drafts = new ArrayList<>();
        List<Map.Entry<Integer, Integer>> lockedOrder = quantitiesByProduct.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .toList();
        for (Map.Entry<Integer, Integer> entry : lockedOrder) {
            Product product = productRepository.findByIdForUpdate(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + entry.getKey()));
            if (!product.isActive()) {
                throw new BusinessRuleException("San pham " + product.getName() + " dang ngung kinh doanh");
            }
            int quantity = entry.getValue();
            if (product.getStockQuantity() < quantity) {
                throw new BusinessRuleException("San pham " + product.getName() + " khong du ton kho");
            }
            product.setStockQuantity(product.getStockQuantity() - quantity);
            drafts.add(new LineDraft(product, quantity, sellingPrice(product)));
        }
        return drafts;
    }

    private BigDecimal sellingPrice(Product product) {
        return product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getBasePrice();
    }

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

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subTotal) {
        BigDecimal discount = coupon.getDiscountType() == DiscountType.PERCENT
                ? subTotal.multiply(coupon.getDiscountValue()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
                : coupon.getDiscountValue();
        return discount.min(subTotal).setScale(2, RoundingMode.HALF_UP);
    }

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

    private void releaseReservedInventory(Order order) {
        for (OrderItem item : order.getItems()) {
            Integer productId = item.getProduct().getId();
            Product product = productRepository.findByIdForUpdate(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay product voi id = " + productId));
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
        }
    }

    private void rollbackCouponUsage(Order order) {
        if (order.getCoupon() == null) {
            return;
        }
        Integer couponId = order.getCoupon().getId();
        Coupon coupon = couponRepository.findByIdForUpdate(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + couponId));
        if (coupon.getUsedCount() > 0) {
            coupon.setUsedCount(coupon.getUsedCount() - 1);
        }
    }
    private record LineDraft(Product product, int quantity, BigDecimal priceAtPurchase) {
        BigDecimal lineTotal() {
            return priceAtPurchase.multiply(BigDecimal.valueOf(quantity));
        }
    }
}
