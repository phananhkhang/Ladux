package org.akira.auratech.controller;

import org.akira.auratech.model.Category;
import org.akira.auratech.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {
    @Autowired
    CategoryService service;

    @GetMapping("/all")
    public List<Category> getAllCategories() {
        return service.getAllCategories();
    }

    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable int id) {
        return service.getCategoryById(id);
    }

    @GetMapping("/name/{name}")
    public Category getCategoryByName(@PathVariable String name) {
        return service.getCategoryByName(name);
    }

    @GetMapping("/slug/{slug}")
    public Category getCategoryBySlug(@PathVariable String slug) {
        return service.getCategoryBySlug(slug);
    }

    @GetMapping("/roots")
    public List<Category> getRootCategories() {
        return service.getRootCategories();
    }

    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return service.createCategory(category);
    }

    @PutMapping
    public Category updateCategory(@RequestBody Category category) {
        return service.updateCategory(category);
    }

    @DeleteMapping("/{id}")
    public void deleteCategoryById(@PathVariable int id) {
        service.deleteCategoryById(id);
    }
}

