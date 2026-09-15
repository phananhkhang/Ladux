package org.akira.ladux.dto.catalog.response;

import java.io.Serializable;

import org.akira.ladux.catalog.domain.model.ProductImage;

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
