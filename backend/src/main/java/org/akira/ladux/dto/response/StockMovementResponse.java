package org.akira.ladux.dto.response;

import java.io.Serializable;
import java.time.Instant;

import org.akira.ladux.model.StockMovement;
import org.akira.ladux.model.enums.StockMovementType;
import org.akira.ladux.model.enums.StockReferenceType;

public record StockMovementResponse(
        Integer id,
        Integer productId,
        String productName,
        Integer quantity,
        StockMovementType movementType,
        StockReferenceType referenceType,
        Long referenceId,
        String note,
        Integer createdById,
        Instant createdAt
) implements Serializable {
    public static StockMovementResponse fromEntity(StockMovement m) {
        if (m == null) {
            return null;
        }
        return new StockMovementResponse(
                m.getId(),
                m.getProduct() == null ? null : m.getProduct().getId(),
                m.getProduct() == null ? null : m.getProduct().getName(),
                m.getQuantity(),
                m.getMovementType(),
                m.getReferenceType(),
                m.getReferenceId(),
                m.getNote(),
                m.getCreatedBy() == null ? null : m.getCreatedBy().getId(),
                m.getCreatedAt()
        );
    }
}
