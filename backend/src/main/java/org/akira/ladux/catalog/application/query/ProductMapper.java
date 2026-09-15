package org.akira.ladux.catalog.application.query;

import java.util.List;

import org.akira.ladux.catalog.api.dto.ProductVariantView;
import org.akira.ladux.catalog.api.dto.ProductView;
import org.akira.ladux.catalog.domain.model.Product;
import org.akira.ladux.catalog.domain.model.ProductVariant;

final class ProductMapper {
    private ProductMapper() {
    }

    static ProductView toView(Product product) {
        List<String> imageUrls = product.getImages() == null ? List.of() : product.getImages().stream()
                .map(image -> image.getImageUrl())
                .toList();
        List<ProductVariantView> variants = product.getVariants() == null ? List.of() : product.getVariants().stream()
                .map(ProductMapper::toVariantView)
                .toList();
        long reviewCount = product.getReviews() == null ? 0 : product.getReviews().size();
        double averageRating = reviewCount == 0 ? 0D : product.getReviews().stream()
                .mapToInt(review -> review.getRating())
                .average()
                .orElse(0D);

        return new ProductView(
                product.getId(),
                product.getBrand() == null ? null : product.getBrand().getId(),
                product.getBrand() == null ? null : product.getBrand().getName(),
                product.getCategory() == null ? null : product.getCategory().getId(),
                product.getCategory() == null ? null : product.getCategory().getName(),
                product.getName(), product.getSlug(), product.getDescription(), product.getCpu(), product.getGpu(),
                product.getDisplay(), product.getBattery(), product.getWeight(), product.getNumberOfFans(), product.getOs(),
                product.isActive(), product.getCreatedAt(), imageUrls, variants, averageRating, reviewCount);
    }

    static ProductVariantView toVariantView(ProductVariant variant) {
        return new ProductVariantView(
                variant.getId(),
                variant.getProduct() == null ? null : variant.getProduct().getId(),
                variant.getSku(),
                variant.getColor() == null ? null : variant.getColor().getId(),
                variant.getColor() == null ? null : variant.getColor().getName(),
                variant.getColor() == null ? null : variant.getColor().getHexCode(),
                variant.getRam(), variant.getRom(), variant.getPrice(), variant.getDiscountPrice(), variant.isActive());
    }
}
