package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;

public record CartItemRequest(
        @NotNull(message = "CartId khong duoc de trong")
        Integer cartId,
        @NotNull(message = "ProductId khong duoc de trong")
        Integer productId,
        Integer quantity
) {}
