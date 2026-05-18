package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record WishlistRequest(
        @NotNull(message = "UserId khong duoc de trong")
        @Positive(message = "UserId phai la so duong")
        Integer userId,

        @NotNull(message = "ProductId khong duoc de trong")
        @Positive(message = "ProductId phai la so duong")
        Integer productId
) {}
