package org.akira.ladux.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record PurchaseOrderItemRequest(
        @NotNull(message = "ProductId khong duoc de trong")
        @Positive(message = "ProductId phai la so duong")
        Integer productId,

        @NotNull(message = "So luong khong duoc de trong")
        @Positive(message = "So luong phai lon hon 0")
        Integer quantity,

        @NotNull(message = "Gia nhap khong duoc de trong")
        @PositiveOrZero(message = "Gia nhap khong duoc am")
        BigDecimal costPrice,

        @Size(max = 255, message = "Ghi chu khong duoc vuot qua 255 ky tu")
        String note
) {}
