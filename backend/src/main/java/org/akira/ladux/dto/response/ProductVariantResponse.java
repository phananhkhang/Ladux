package org.akira.ladux.dto.response;


import org.akira.ladux.model.Color;
import org.akira.ladux.model.ProductVariant;

import java.math.BigDecimal;

public record ProductVariantResponse(
    Integer id,
    Integer productId,
    String sku,
    Color color,
    String ram,
    String rom,
    BigDecimal price,
    BigDecimal discountPrice,
    int stockQuantity,
    boolean isActive
) {
    private static final long serialVersionUID = 1L; //Dùng cho redis cache, để đảm bảo rằng các phiên bản khác nhau của lớp có thể được nhận dạng là cùng một lớp.

    public static ProductVariantResponse fromEntity(ProductVariant variant) {
        if (variant == null) {
            return null;
        }
        return new ProductVariantResponse(
                variant.getId(),
                variant.getProduct() != null ? variant.getProduct().getId() : null,
                variant.getSku(),
                variant.getColor(),
                variant.getRam(),
                variant.getRom(),
                variant.getPrice(),
                variant.getDiscountPrice(),
                variant.getStockQuantity(),
                variant.isActive()
        );
    }
}
