package org.akira.auratech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductRequest {
    @NotNull(message = "BrandId khong duoc de trong")
    private Integer brandId;

    @NotNull(message = "CategoryId khong duoc de trong")
    private Integer categoryId;

    @NotBlank(message = "SKU khong duoc de trong")
    private String sku;

    @NotBlank(message = "Ten khong duoc de trong")
    private String name;

    private String slug;

    @NotNull(message = "BasePrice khong duoc de trong")
    private BigDecimal basePrice;

    private BigDecimal discountPrice;

    private Integer stockQuantity;

    private String specs;

    private String thumbnail;

    private Boolean isActive;
}

