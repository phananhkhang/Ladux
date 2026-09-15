package org.akira.ladux.dto.catalog.response;

import java.io.Serializable;

import org.akira.ladux.catalog.domain.model.Category;

public record CategoryResponse(
        Integer id,
        String name,
        String slug,
        String imageUrl
) implements Serializable {
    public static CategoryResponse fromEntity(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getImageUrl()
        );
    }
}
