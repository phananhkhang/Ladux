package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;

public record ReviewRequest(
        @NotNull(message = "UserId khong duoc de trong")
        Integer userId,
        @NotNull(message = "ProductId khong duoc de trong")
        Integer productId,
        Integer rating,
        String comment
) {}
