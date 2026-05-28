package org.akira.auratech.dto.response;

import org.akira.auratech.model.Category;

public record CategoryResponse(
        Integer id,
        String name,
        String slug,
        Integer parentId
) {
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
