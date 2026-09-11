package org.akira.ladux.service;

import org.akira.ladux.dto.catalog.request.CategoryRequest;
import org.akira.ladux.dto.catalog.response.CategoryResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface CategoryService {
    PageResponse<CategoryResponse> getAllCategories(Pageable pageable);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(int id, CategoryRequest request);

    void deleteCategoryById(int id);

    String uploadCategoryImage(MultipartFile file);
}
