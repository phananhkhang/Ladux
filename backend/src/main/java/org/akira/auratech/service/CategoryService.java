package org.akira.auratech.service;

import org.akira.auratech.dto.request.CategoryRequest;
import org.akira.auratech.dto.response.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {
    Page<CategoryResponse> getAllCategories(Pageable pageable);

    CategoryResponse getCategoryById(int id);

    CategoryResponse getCategoryByName(String name);

    CategoryResponse getCategoryBySlug(String slug);

    Page<CategoryResponse> getRootCategories(Pageable pageable);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(int id, CategoryRequest request);

    void deleteCategoryById(int id);
}
