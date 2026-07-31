package org.akira.ladux.dto.response.common;

import org.akira.ladux.model.ProductImage;

import java.io.Serializable;

public record ProductImageResponse(
        Integer id,
        String imageUrl
) implements Serializable {
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
