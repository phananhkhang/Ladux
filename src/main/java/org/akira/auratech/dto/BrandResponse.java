package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.Brand;

@Getter
@Setter
@Builder
public class BrandResponse {
    private int id;
    private String name;
    private String slug;
    private String logoUrl;

    public static BrandResponse fromEntity(Brand brand) {
        if (brand == null) {
            return null;
        }
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .logoUrl(brand.getLogoUrl())
                .build();
    }
}
