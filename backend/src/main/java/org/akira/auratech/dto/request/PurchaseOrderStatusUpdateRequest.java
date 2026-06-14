package org.akira.auratech.dto.request;

import org.akira.auratech.model.enums.PurchaseOrderStatus;

import jakarta.validation.constraints.NotNull;

public record PurchaseOrderStatusUpdateRequest(
        @NotNull(message = "Trang thai khong duoc de trong")
        PurchaseOrderStatus status
) {}
