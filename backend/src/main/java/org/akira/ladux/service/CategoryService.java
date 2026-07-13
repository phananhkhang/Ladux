package org.akira.ladux.service;

import org.akira.ladux.dto.request.CategoryRequest;
import org.akira.ladux.dto.response.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CategoryService {
    Page<CategoryResponse> getAllCategories(Pageable pageable);

    CategoryResponse getCategoryById(int id);

    CategoryResponse getCategoryByName(String name);

    CategoryResponse getCategoryBySlug(String slug);

    Page<CategoryResponse> getRootCategories(Pageable pageable);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(int id, CategoryRequest request);

    void deleteCategoryById(int id);

    void uploadCategoryImage(MultipartFile file);
}
