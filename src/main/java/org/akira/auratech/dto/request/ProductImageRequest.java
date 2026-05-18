package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductImageRequest(
        @NotNull(message = "ProductId khong duoc de trong")
        Integer productId,
        @NotBlank(message = "ImageUrl khong duoc de trong")
        String imageUrl,
        Boolean isPrimary
) {}
