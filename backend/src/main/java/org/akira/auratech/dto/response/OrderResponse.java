package org.akira.auratech.dto.response;

import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;
import org.akira.auratech.model.enums.PaymentProvider;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Integer id,
        Integer userId,
        Integer couponId,
        BigDecimal subTotal,
        BigDecimal discountAmount,
        BigDecimal finalAmount,
        OrderStatus status,
        String shippingAddress,
        String trackingNumber,
        Instant createdAt,
        Instant paymentExpiresAt,
        List<OrderItemResponse> orderItems,
        PaymentProvider paymentProvider
) {
    public static OrderResponse fromEntity(Order order) {
        if (order == null) {
            return null;
        }
        PaymentProvider provider = resolvePaymentProvider(order);
        return new OrderResponse(
                order.getId(),
                order.getUser() == null ? null : order.getUser().getId(),
                order.getCoupon() == null ? null : order.getCoupon().getId(),
                order.getSubTotal(),
                order.getDiscountAmount(),
                order.getFinalAmount(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getTrackingNumber(),
                order.getCreatedAt(),
                order.getPaymentExpiresAt(),
                order.getItems().stream()
                        .map(OrderItemResponse::fromEntity)
                        .toList(),
                provider
        );
    }

    public static OrderResponse summaryFromEntity(Order order) {
        if (order == null) {
            return null;
        }
        PaymentProvider provider = resolvePaymentProvider(order);
        return new OrderResponse(
                order.getId(),
                order.getUser() == null ? null : order.getUser().getId(),
                order.getCoupon() == null ? null : order.getCoupon().getId(),
                order.getSubTotal(),
                order.getDiscountAmount(),
                order.getFinalAmount(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getTrackingNumber(),
                order.getCreatedAt(),
                order.getPaymentExpiresAt(),
                List.of(),
                provider
        );
    }

    private static PaymentProvider resolvePaymentProvider(Order order) {
        if (order.getPayments() != null && !order.getPayments().isEmpty()) {
            // prefer the latest payment's provider
            return order.getPayments().get(order.getPayments().size() - 1).getProvider();
        }
        return null;
    }
}
