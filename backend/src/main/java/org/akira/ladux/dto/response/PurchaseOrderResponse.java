package org.akira.ladux.dto.response;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.akira.ladux.model.PurchaseOrder;
import org.akira.ladux.model.enums.PurchaseOrderStatus;

public record PurchaseOrderResponse(
        Integer id,
        Integer supplierId,
        String supplierName,
        PurchaseOrderStatus status,
        Instant expectedDeliveryDate,
        BigDecimal totalAmount,
        String note,
        Integer createdById,
        Instant createdAt,
        Instant updatedAt,
        List<PurchaseOrderItemResponse> items
) implements Serializable {

    public static PurchaseOrderResponse fromEntity(PurchaseOrder po) {
        if (po == null) {
            return null;
        }
        return new PurchaseOrderResponse(
                po.getId(),
                po.getSupplier() == null ? null : po.getSupplier().getId(),
                po.getSupplier() == null ? null : po.getSupplier().getName(),
                po.getStatus(),
                po.getExpectedDeliveryDate(),
                po.getTotalAmount(),
                po.getNote(),
                po.getCreatedBy() == null ? null : po.getCreatedBy().getId(),
                po.getCreatedAt(),
                po.getUpdatedAt(),
                po.getItems() == null ? List.of() : po.getItems().stream()
                        .map(PurchaseOrderItemResponse::fromEntity)
                        .toList()
        );
    }

    /** Ban tom tat (khong kem danh sach item) cho man hinh danh sach. */
    public static PurchaseOrderResponse summaryFromEntity(PurchaseOrder po) {
        if (po == null) {
            return null;
        }
        return new PurchaseOrderResponse(
                po.getId(),
                po.getSupplier() == null ? null : po.getSupplier().getId(),
                po.getSupplier() == null ? null : po.getSupplier().getName(),
                po.getStatus(),
                po.getExpectedDeliveryDate(),
                po.getTotalAmount(),
                po.getNote(),
                po.getCreatedBy() == null ? null : po.getCreatedBy().getId(),
                po.getCreatedAt(),
                po.getUpdatedAt(),
                List.of()
        );
    }
}
