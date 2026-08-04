package org.akira.ladux.dto.catalog.response;

import org.akira.ladux.dto.catalog.response.BrandResponse;
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
        String description,
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
        List<ProductVariantResponse> variants,
        double averageRating,
        long reviewCount
) implements Serializable {
    public static ProductResponse fromEntity(Product product) {
        if (product == null) return null;
        return new ProductResponse(
                product.getId(),
                product.getBrand() == null ? null : BrandResponse.fromEntity(product.getBrand()),
                product.getCategory() == null ? null : CategoryResponse.fromEntity(product.getCategory()),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
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
                        .toList(),
                product.getReviews() == null ? 0.0 : product.getReviews().stream()
                        .mapToInt(review -> review.getRating())
                        .average()
                        .orElse(0.0),
                product.getReviews() == null ? 0L : product.getReviews().size()
        );
    }

    public static ProductResponse summaryFromEntity(Product product) {
        return fromEntity(product);
    }
}
