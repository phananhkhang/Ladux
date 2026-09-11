package org.akira.ladux.service.impl;

import org.akira.ladux.dto.catalog.request.CategoryRequest;
import org.akira.ladux.dto.catalog.response.CategoryResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Category;
import org.akira.ladux.repository.CategoryRepository;
import org.akira.ladux.repository.ProductRepository;
import org.akira.ladux.service.CategoryService;
import org.akira.ladux.service.FileStorageService;
import org.akira.ladux.utils.SlugUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository repo;
    private final ProductRepository productRepo;
    private final FileStorageService fileStorage;

    @Value("${app.upload.category-dir:categories}")
    private String categoryUploadDir;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        return repo.findAll(pageable)
                .map(CategoryResponse::fromEntity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.name())
                .slug(SlugUtils.toSlug(request.name()))
                .imageUrl(blankToNull(request.imageUrl()))
                .build();
        return CategoryResponse.fromEntity(repo.save(category));
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse updateCategory(int id, CategoryRequest request) {
        Category category = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + id));
        if (request.name() != null) {
            category.setName(request.name());
            category.setSlug(SlugUtils.toSlug(request.name()));
        }
        // imageUrl optional: null/absent = keep current; empty string = clear
        if (request.imageUrl() != null) {
            String newUrl = blankToNull(request.imageUrl());
            String oldUrl = category.getImageUrl();
            if (oldUrl != null && !oldUrl.equals(newUrl)) {
                fileStorage.deleteIfLocal(oldUrl);
            }
            category.setImageUrl(newUrl);
        }
        return CategoryResponse.fromEntity(category);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategoryById(int id) {
        Category category = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + id));
        if (productRepo.existsByCategoryId(id)) {
            throw new BusinessRuleException("Không thể xóa category này vì nó có sản phẩm liên quan");
        }
        String imageUrl = category.getImageUrl();
        repo.deleteById(id);
        fileStorage.deleteIfLocal(imageUrl);
    }

    @Override
    public String uploadCategoryImage(MultipartFile file) {
        return fileStorage.store(categoryUploadDir, file);
    }

}
