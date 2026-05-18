package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductRequest(
        @NotNull(message = "BrandId khong duoc de trong")
        Integer brandId,
        @NotNull(message = "CategoryId khong duoc de trong")
        Integer categoryId,
        @NotBlank(message = "SKU khong duoc de trong")
        String sku,
        @NotBlank(message = "Ten khong duoc de trong")
        String name,
        String slug,
        @NotNull(message = "BasePrice khong duoc de trong")
        BigDecimal basePrice,
        BigDecimal discountPrice,
        Integer stockQuantity,
        String specs,
        String thumbnail,
        Boolean isActive
) {}
