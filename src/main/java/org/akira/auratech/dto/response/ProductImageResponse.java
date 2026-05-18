package org.akira.auratech.dto.response;

import org.akira.auratech.model.ProductImage;

public record ProductImageResponse(
        Integer id,
        Integer productId,
        String imageUrl,
        boolean isPrimary
) {
    public static ProductImageResponse fromEntity(ProductImage image) {
        if (image == null) {
            return null;
        }
        return new ProductImageResponse(
                image.getId(),
                image.getProduct() == null ? null : image.getProduct().getId(),
                image.getImageUrl(),
                image.isPrimary()
        );
    }
}
