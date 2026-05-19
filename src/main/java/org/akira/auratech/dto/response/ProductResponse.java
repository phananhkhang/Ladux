package org.akira.auratech.dto.response;

import org.akira.auratech.model.Product;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProductResponse(
        Integer id,
        BrandResponse brand,
        CategoryResponse category,
        String sku,
        String name,
        String slug,
        BigDecimal basePrice,
        BigDecimal discountPrice,
        int stockQuantity,
        String specs,
        String thumbnail,
        boolean isActive,
        Instant createdAt,
        List<ProductImageResponse> image
) {
    public static ProductResponse fromEntity(Product product) {
        if (product == null) {
            return null;
        }
        return new ProductResponse(
                product.getId(),
                product.getBrand() == null ? null : BrandResponse.fromEntity(product.getBrand()),
                product.getCategory() == null ? null : CategoryResponse.fromEntity(product.getCategory()),
                product.getSku(),
                product.getName(),
                product.getSlug(),
                product.getBasePrice(),
                product.getDiscountPrice(),
                product.getStockQuantity(),
                product.getSpecs(),
                product.getThumbnail(),
                product.isActive(),
                product.getCreatedAt(),
                product.getImages() == null ? List.of() : product.getImages().stream()
                        .map(ProductImageResponse::fromEntity)
                        .toList()
        );
    }
}
