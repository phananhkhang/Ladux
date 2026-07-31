package org.akira.ladux.dto.response.common;

import org.akira.ladux.dto.response.common.BrandResponse;
import org.akira.ladux.model.Product;
import java.io.Serializable;
import java.time.Instant;
import java.util.List;

public record ProductResponse(
        Integer id,
        BrandResponse brand,
        CategoryResponse category,
        String name,
        String slug,
        String cpu,
        String gpu,
        String display,
        String battery,
        String weight,
        Integer numberOfFans,
        String os,
        boolean isActive,
        Instant createdAt,
        List<ProductImageResponse> images,
        List<ProductVariantResponse> variants
) implements Serializable {
    public static ProductResponse fromEntity(Product product) {
        if (product == null) return null;
        return new ProductResponse(
                product.getId(),
                product.getBrand() == null ? null : BrandResponse.fromEntity(product.getBrand()),
                product.getCategory() == null ? null : CategoryResponse.fromEntity(product.getCategory()),
                product.getName(),
                product.getSlug(),
                product.getCpu(),
                product.getGpu(),
                product.getDisplay(),
                product.getBattery(),
                product.getWeight(),
                product.getNumberOfFans(),
                product.getOs(),
                product.isActive(),
                product.getCreatedAt(),
                product.getImages() == null ? List.of() : product.getImages().stream()
                        .map(ProductImageResponse::fromEntity)
                        .toList(),
                product.getVariants() == null ? List.of() : product.getVariants().stream()
                        .map(ProductVariantResponse::fromEntity)
                        .toList()
        );
    }

    public static ProductResponse summaryFromEntity(Product product) {
        return fromEntity(product);
    }
}