package org.akira.ladux.dto.response;

import org.akira.ladux.model.Category;

import java.io.Serializable;

public record CategoryResponse(
        Integer id,
        String name,
        String slug,
        Integer parentId
) implements Serializable {
    public static CategoryResponse fromEntity(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getParent() == null ? null : category.getParent().getId()
        );
    }
}
