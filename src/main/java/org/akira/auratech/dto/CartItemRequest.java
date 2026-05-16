package org.akira.auratech.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemRequest {
    @NotNull(message = "CartId khong duoc de trong")
    private Integer cartId;

    @NotNull(message = "ProductId khong duoc de trong")
    private Integer productId;

    private Integer quantity;
}

