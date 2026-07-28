package org.akira.ladux.dto.response;

import org.akira.ladux.model.OrderItem;
import java.io.Serializable;
import java.math.BigDecimal;

public record OrderItemResponse(
        Integer id,
        Integer orderId,
        Integer productVariantId,
        int quantity,
        BigDecimal priceAtPurchase
) implements Serializable {
    public static OrderItemResponse fromEntity(OrderItem item) {
        if (item == null) {
            return null;
        }
        return new OrderItemResponse(
                item.getId(),
                item.getOrder() == null ? null : item.getOrder().getId(),
                item.getProductVariant() == null ? null : item.getProductVariant().getId(),
                item.getQuantity(),
                item.getPriceAtPurchase()
        );
    }
}
