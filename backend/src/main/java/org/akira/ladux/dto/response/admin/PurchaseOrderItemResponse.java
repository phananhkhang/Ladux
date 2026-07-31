package org.akira.ladux.dto.response.admin;

import java.io.Serializable;
import java.math.BigDecimal;

import org.akira.ladux.model.PurchaseOrderItem;

public record PurchaseOrderItemResponse(
        Integer id,
        Integer productVariantId,
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
                item.getProductVariant() == null ? null : item.getProductVariant().getId(),
                item.getProductVariant() == null ? null : item.getProductVariant().getProduct().getName(),
                item.getQuantity(),
                item.getCostPrice(),
                item.getReceivedQuantity(),
                item.getNote()
        );
    }
}
