package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.akira.auratech.model.ProductImage;

import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @NotNull(message = "BrandId khong duoc de trong")
        @Positive(message = "BrandId phai la so duong")
        Integer brandId,

        @NotNull(message = "CategoryId khong duoc de trong")
        @Positive(message = "CategoryId phai la so duong")
        Integer categoryId,

        @NotBlank(message = "SKU khong duoc de trong")
        @Size(max = 50, message = "SKU khong duoc vuot qua 50 ky tu")
        String sku,

        @NotBlank(message = "Ten khong duoc de trong")
        @Size(max = 255, message = "Ten san pham khong duoc vuot qua 255 ky tu")
        String name,

        @NotNull(message = "BasePrice khong duoc de trong")
        @Positive(message = "BasePrice phai lon hon 0")
        BigDecimal basePrice,

        @PositiveOrZero(message = "DiscountPrice phai lon hon 0")
        BigDecimal discountPrice,

        @PositiveOrZero(message = "StockQuantity khong duoc am")
        Integer stockQuantity,

        String specs,

        @Size(max = 255, message = "Thumbnail khong duoc vuot qua 255 ky tu")
        String thumbnail,

        Boolean isActive,

        List<ProductImage> imageUrls
) {}
