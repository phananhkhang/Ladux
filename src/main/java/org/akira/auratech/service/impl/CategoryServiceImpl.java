package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CategoryRequest;
import org.akira.auratech.dto.CategoryResponse;
import org.akira.auratech.model.Category;
import org.akira.auratech.repository.CategoryRepository;
import org.akira.auratech.service.CategoryService;
import org.akira.auratech.utils.SlugUtils;
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
        return CategoryResponse.fromEntity(repo.findById(id).orElse(null));
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
        if (request.getParentId() != null) {
            parent = repo.findById(request.getParentId()).orElse(null);
            if (parent == null) {
                return null;
            }
        }
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtils.toSlug(request.getName());
        }
        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .parent(parent)
                .build();
        return CategoryResponse.fromEntity(repo.save(category));
    }

    @Override
    public CategoryResponse updateCategory(int id, CategoryRequest request) {
        Category category = repo.findById(id).orElse(null);
        if (category == null) {
            return null;
        }
        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            category.setSlug(request.getSlug());
        } else if (request.getName() != null) {
            category.setSlug(SlugUtils.toSlug(request.getName()));
        }
        if (request.getParentId() != null) {
            Category parent = repo.findById(request.getParentId()).orElse(null);
            if (parent == null) {
                return null;
            }
            category.setParent(parent);
        }
        return CategoryResponse.fromEntity(repo.save(category));
    }

    @Override
    public void deleteCategoryById(int id) {
        repo.deleteById(id);
    }
}
