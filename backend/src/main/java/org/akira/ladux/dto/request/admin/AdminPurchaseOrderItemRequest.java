package org.akira.ladux.dto.request.admin;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record AdminPurchaseOrderItemRequest(
        @NotNull(message = "ProductVariantId khong duoc de trong")
        @Positive(message = "ProductVariantId phai la so duong")
        Integer productVariantId,

        @NotNull(message = "So luong khong duoc de trong")
        @Positive(message = "So luong phai lon hon 0")
        Integer quantity,

        @NotNull(message = "Gia nhap khong duoc de trong")
        @PositiveOrZero(message = "Gia nhap khong duoc am")
        BigDecimal costPrice,

        @Size(max = 255, message = "Ghi chu khong duoc vuot qua 255 ky tu")
        String note
) {}
