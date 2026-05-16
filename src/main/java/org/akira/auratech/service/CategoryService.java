package org.akira.auratech.service;

import org.akira.auratech.dto.CategoryRequest;
import org.akira.auratech.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(int id);

    CategoryResponse getCategoryByName(String name);

    CategoryResponse getCategoryBySlug(String slug);

    List<CategoryResponse> getRootCategories();

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(int id, CategoryRequest request);

    void deleteCategoryById(int id);
}
