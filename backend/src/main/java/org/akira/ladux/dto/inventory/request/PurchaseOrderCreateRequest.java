package org.akira.ladux.dto.inventory.request;

import java.time.Instant;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PurchaseOrderCreateRequest(
        @NotNull(message = "SupplierId khong duoc de trong")
        @Positive(message = "SupplierId phai la so duong")
        Integer supplierId,

        @Size(max = 500, message = "Ghi chu khong duoc vuot qua 500 ky tu")
        String note,

        @NotEmpty(message = "Don mua hang phai co it nhat 1 san pham")
        @Valid
        List<AdminPurchaseOrderItemRequest> items
) {}
