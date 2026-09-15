package org.akira.ladux.dto.catalog.response;

import java.io.Serializable;

import org.akira.ladux.catalog.domain.model.Brand;

public record BrandResponse(
        int id,
        String name,
        String logoUrl,
        String slug) implements Serializable {
    public static BrandResponse fromEntity(Brand brand) {
        if (brand == null) {
            return null;
        }
        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getLogoUrl(),
                brand.getSlug());
    }
}
