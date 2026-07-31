package org.akira.ladux.dto.catalog.response;

import org.akira.ladux.model.Brand;

import java.io.Serializable;

public record BrandResponse(
        int id,
        String name,
        String logoUrl,
        String slug
) implements Serializable {
        public static BrandResponse fromEntity(Brand brand) {
        if (brand == null) {
            return null;
        }
            return new BrandResponse(
                    brand.getId(),
                    brand.getName(),
                    brand.getLogoUrl(),
                    brand.getSlug()
            );
    }
}
