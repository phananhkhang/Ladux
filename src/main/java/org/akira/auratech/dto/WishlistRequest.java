package org.akira.auratech.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WishlistRequest {
    @NotNull(message = "UserId khong duoc de trong")
    private Integer userId;

    @NotNull(message = "ProductId khong duoc de trong")
    private Integer productId;
}

