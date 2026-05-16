package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.Order;
import org.akira.auratech.model.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
public class OrderResponse {
    private Integer id;
    private Integer userId;
    private Integer couponId;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private String trackingNumber;
    private Instant createdAt;

    public static OrderResponse fromEntity(Order order) {
        if (order == null) {
            return null;
        }
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser() == null ? null : order.getUser().getId())
                .couponId(order.getCoupon() == null ? null : order.getCoupon().getId())
                .subTotal(order.getSubTotal())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .trackingNumber(order.getTrackingNumber())
                .createdAt(order.getCreatedAt())
                .build();
    }
}

