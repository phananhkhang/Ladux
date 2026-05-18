package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CategoryRequest;
import org.akira.auratech.dto.response.CategoryResponse;
import org.akira.auratech.model.Category;
import org.akira.auratech.repository.CategoryRepository;
import org.akira.auratech.service.CategoryService;
import org.akira.auratech.utils.SlugUtils;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository repo;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return repo.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(int id) {
        return CategoryResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + id)));
    }

    @Override
    public CategoryResponse getCategoryByName(String name) {
        return CategoryResponse.fromEntity(repo.findByName(name));
    }

    @Override
    public CategoryResponse getCategoryBySlug(String slug) {
        return CategoryResponse.fromEntity(repo.findBySlug(slug));
    }

    @Override
    public List<CategoryResponse> getRootCategories() {
        return repo.findByParentIsNull().stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        Category parent = null;
        if (request.parentId() != null) {
            parent = repo.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + request.parentId()));
        }
        String slug = request.slug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtils.toSlug(request.name());
        }
        Category category = Category.builder()
                .name(request.name())
                .slug(slug)
                .parent(parent)
                .build();
        return CategoryResponse.fromEntity(repo.save(category));
    }

    @Override
    public CategoryResponse updateCategory(int id, CategoryRequest request) {
        Category category = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + id));
        if (request.name() != null) {
            category.setName(request.name());
        }
        if (request.slug() != null && !request.slug().isBlank()) {
            category.setSlug(request.slug());
        } else if (request.name() != null) {
            category.setSlug(SlugUtils.toSlug(request.name()));
        }
        if (request.parentId() != null) {
            Category parent = repo.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay category voi id = " + request.parentId()));
            category.setParent(parent);
        }
        return CategoryResponse.fromEntity(repo.save(category));
    }

    @Override
    public void deleteCategoryById(int id) {
        repo.deleteById(id);
    }
}
