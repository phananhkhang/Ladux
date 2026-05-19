package org.akira.auratech.dto.response;

import org.akira.auratech.model.ProductImage;

public record ProductImageResponse(
        Integer id,
        String imageUrl
) {
    public static ProductImageResponse fromEntity(ProductImage image) {
        if (image == null) {
            return null;
        }
        return new ProductImageResponse(
                image.getId(),
                image.getImageUrl()
        );
    }
}
