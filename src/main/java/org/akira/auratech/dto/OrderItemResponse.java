package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.OrderItem;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class OrderItemResponse {
    private Integer id;
    private Integer orderId;
    private Integer productId;
    private int quantity;
    private BigDecimal priceAtPurchase;

    public static OrderItemResponse fromEntity(OrderItem item) {
        if (item == null) {
            return null;
        }
        return OrderItemResponse.builder()
                .id(item.getId())
                .orderId(item.getOrder() == null ? null : item.getOrder().getId())
                .productId(item.getProduct() == null ? null : item.getProduct().getId())
                .quantity(item.getQuantity())
                .priceAtPurchase(item.getPriceAtPurchase())
                .build();
    }
}
