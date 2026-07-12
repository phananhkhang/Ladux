package org.akira.ladux.dto.request;

import org.akira.ladux.model.enums.PurchaseOrderStatus;

import jakarta.validation.constraints.NotNull;

public record PurchaseOrderStatusUpdateRequest(
        @NotNull(message = "Trang thai khong duoc de trong")
        PurchaseOrderStatus status
) {}
