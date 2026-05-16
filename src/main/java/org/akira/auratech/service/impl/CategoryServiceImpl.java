package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
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
    public List<Category> getAllCategories() {
        return repo.findAll();
    }

    @Override
    public Category getCategoryById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Category getCategoryByName(String name) {
        return repo.findByName(name);
    }

    @Override
    public Category getCategoryBySlug(String slug) {
        return repo.findBySlug(slug);
    }

    @Override
    public List<Category> getRootCategories() {
        return repo.findByParentIsNull();
    }

    @Override
    public Category createCategory(Category category) {
        if (category.getName() != null) {
            category.setSlug(SlugUtils.toSlug(category.getName()));
        }
        return repo.save(category);
    }

    @Override
    public Category updateCategory(Category category) {
        if (category.getName() != null) {
            category.setSlug(SlugUtils.toSlug(category.getName()));
        }
        return repo.save(category);
    }

    @Override
    public void deleteCategoryById(int id) {
        repo.deleteById(id);
    }
}

