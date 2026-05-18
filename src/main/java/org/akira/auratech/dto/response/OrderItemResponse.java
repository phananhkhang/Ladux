package org.akira.auratech.dto.response;

import org.akira.auratech.model.OrderItem;
import java.math.BigDecimal;

public record OrderItemResponse(
        Integer id,
        Integer orderId,
        Integer productId,
        int quantity,
        BigDecimal priceAtPurchase
) {
    public static OrderItemResponse fromEntity(OrderItem item) {
        if (item == null) {
            return null;
        }
        return new OrderItemResponse(
                item.getId(),
                item.getOrder() == null ? null : item.getOrder().getId(),
                item.getProduct() == null ? null : item.getProduct().getId(),
                item.getQuantity(),
                item.getPriceAtPurchase()
        );
    }
}
