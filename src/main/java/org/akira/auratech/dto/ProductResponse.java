package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.Product;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
public class ProductResponse {
    private Integer id;
    private Integer brandId;
    private Integer categoryId;
    private String sku;
    private String name;
    private String slug;
    private BigDecimal basePrice;
    private BigDecimal discountPrice;
    private int stockQuantity;
    private String specs;
    private String thumbnail;
    private boolean isActive;
    private Instant createdAt;

    public static ProductResponse fromEntity(Product product) {
        if (product == null) {
            return null;
        }
        return ProductResponse.builder()
                .id(product.getId())
                .brandId(product.getBrand() == null ? null : product.getBrand().getId())
                .categoryId(product.getCategory() == null ? null : product.getCategory().getId())
                .sku(product.getSku())
                .name(product.getName())
                .slug(product.getSlug())
                .basePrice(product.getBasePrice())
                .discountPrice(product.getDiscountPrice())
                .stockQuantity(product.getStockQuantity())
                .specs(product.getSpecs())
                .thumbnail(product.getThumbnail())
                .isActive(product.isActive())
                .createdAt(product.getCreatedAt())
                .build();
    }
}

