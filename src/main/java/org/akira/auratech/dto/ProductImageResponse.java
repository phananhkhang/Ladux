package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.ProductImage;

@Getter
@Setter
@Builder
public class ProductImageResponse {
    private Integer id;
    private Integer productId;
    private String imageUrl;
    private boolean isPrimary;

    public static ProductImageResponse fromEntity(ProductImage image) {
        if (image == null) {
            return null;
        }
        return ProductImageResponse.builder()
                .id(image.getId())
                .productId(image.getProduct() == null ? null : image.getProduct().getId())
                .imageUrl(image.getImageUrl())
                .isPrimary(image.isPrimary())
                .build();
    }
}

