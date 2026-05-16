package org.akira.auratech.service;

import org.akira.auratech.model.Category;

import java.util.List;

public interface CategoryService {
    List<Category> getAllCategories();

    Category getCategoryById(int id);

    Category getCategoryByName(String name);

    Category getCategoryBySlug(String slug);

    List<Category> getRootCategories();

    Category createCategory(Category category);

    Category updateCategory(Category category);

    void deleteCategoryById(int id);
}
