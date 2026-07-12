package org.akira.ladux.dto.response;

import java.io.Serializable;
import java.math.BigDecimal;

import org.akira.ladux.model.PurchaseOrderItem;

public record PurchaseOrderItemResponse(
        Integer id,
        Integer productId,
        String productName,
        Integer quantity,
        BigDecimal costPrice,
        Integer receivedQuantity,
        String note
) implements Serializable {
    public static PurchaseOrderItemResponse fromEntity(PurchaseOrderItem item) {
        if (item == null) {
            return null;
        }
        return new PurchaseOrderItemResponse(
                item.getId(),
                item.getProduct() == null ? null : item.getProduct().getId(),
                item.getProduct() == null ? null : item.getProduct().getName(),
                item.getQuantity(),
                item.getCostPrice(),
                item.getReceivedQuantity(),
                item.getNote()
        );
    }
}
