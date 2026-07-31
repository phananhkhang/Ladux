package org.akira.ladux.dto.catalog.response;

import org.akira.ladux.model.ProductVariant;

import java.io.Serializable;
import java.math.BigDecimal;

public record ProductVariantResponse(
    Integer id,
    Integer productId,
    String sku,
    ColorResponse color,
    String ram,
    String rom,
    BigDecimal price,
    BigDecimal discountPrice,
    int stockQuantity,
    boolean isActive
) implements Serializable {
    private static final long serialVersionUID = 1L;

    public static ProductVariantResponse fromEntity(ProductVariant variant) {
        if (variant == null) {
            return null;
        }
        return new ProductVariantResponse(
                variant.getId(),
                variant.getProduct() != null ? variant.getProduct().getId() : null,
                variant.getSku(),
                variant.getColor() != null ? ColorResponse.fromEntity(variant.getColor()) : null,
                variant.getRam(),
                variant.getRom(),
                variant.getPrice(),
                variant.getDiscountPrice(),
                variant.getStockQuantity(),
                variant.isActive()
        );
    }
}
