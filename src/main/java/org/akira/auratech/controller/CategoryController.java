package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CategoryRequest;
import org.akira.auratech.dto.CategoryResponse;
import org.akira.auratech.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;

    @GetMapping
    public List<CategoryResponse> getAllCategories() {
        return service.getAllCategories();
    }

    @GetMapping("/{id}")
    public CategoryResponse getCategoryById(@PathVariable int id) {
        return service.getCategoryById(id);
    }

    @GetMapping("/name/{name}")
    public CategoryResponse getCategoryByName(@PathVariable String name) {
        return service.getCategoryByName(name);
    }

    @GetMapping("/slug/{slug}")
    public CategoryResponse getCategoryBySlug(@PathVariable String slug) {
        return service.getCategoryBySlug(slug);
    }

    @GetMapping("/roots")
    public List<CategoryResponse> getRootCategories() {
        return service.getRootCategories();
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(service.createCategory(request));
    }

    @PutMapping("/{id}")
    public CategoryResponse updateCategory(@PathVariable int id, @RequestBody CategoryRequest request) {
        return service.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteCategoryById(@PathVariable int id) {
        service.deleteCategoryById(id);
    }
}
