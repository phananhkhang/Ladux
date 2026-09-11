package org.akira.ladux.service;

import org.akira.ladux.dto.catalog.request.CategoryRequest;
import org.akira.ladux.dto.catalog.response.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CategoryService {
    Page<CategoryResponse> getAllCategories(Pageable pageable);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(int id, CategoryRequest request);

    void deleteCategoryById(int id);

    String uploadCategoryImage(MultipartFile file);
}
