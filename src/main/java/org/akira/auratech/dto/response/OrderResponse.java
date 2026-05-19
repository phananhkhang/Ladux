package org.akira.auratech.dto.response;

import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;
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
        List<OrderItemResponse> orderItems
) {
    public static OrderResponse fromEntity(Order order) {
        if (order == null) {
            return null;
        }
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
                order.getItems().stream()
                        .map(OrderItemResponse::fromEntity)
                        .toList()
        );
    }
}
