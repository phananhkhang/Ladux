package org.akira.ladux.dto.request.admin;

import jakarta.validation.constraints.Size;
import org.akira.ladux.model.enums.PurchaseOrderStatus;

import jakarta.validation.constraints.NotNull;

public record PurchaseOrderStatusUpdateRequest(
        @NotNull(message = "Trang thai khong duoc de trong")
        PurchaseOrderStatus status,
        @Size(max = 500, message = "Ly do huy khong duoc vuot qua 500 ky tu")
        String cancelReason
) {}
