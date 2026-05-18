package org.akira.auratech.dto.response;

import org.akira.auratech.model.Product;
import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        Integer id,
        Integer brandId,
        Integer categoryId,
        String sku,
        String name,
        String slug,
        BigDecimal basePrice,
        BigDecimal discountPrice,
        int stockQuantity,
        String specs,
        String thumbnail,
        boolean isActive,
        Instant createdAt
) {
    public static ProductResponse fromEntity(Product product) {
        if (product == null) {
            return null;
        }
        return new ProductResponse(
                product.getId(),
                product.getBrand() == null ? null : product.getBrand().getId(),
                product.getCategory() == null ? null : product.getCategory().getId(),
                product.getSku(),
                product.getName(),
                product.getSlug(),
                product.getBasePrice(),
                product.getDiscountPrice(),
                product.getStockQuantity(),
                product.getSpecs(),
                product.getThumbnail(),
                product.isActive(),
                product.getCreatedAt()
        );
    }
}
