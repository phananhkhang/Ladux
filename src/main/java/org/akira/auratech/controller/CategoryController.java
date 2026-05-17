package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CategoryRequest;
import org.akira.auratech.dto.CategoryResponse;
import org.akira.auratech.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(service.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable int id) {
        return ResponseEntity.ok(service.getCategoryById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<CategoryResponse> getCategoryByName(@PathVariable String name) {
        return ResponseEntity.ok(service.getCategoryByName(name));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<CategoryResponse> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.getCategoryBySlug(slug));
    }

    @GetMapping("/roots")
    public ResponseEntity<List<CategoryResponse>> getRootCategories() {
        return ResponseEntity.ok(service.getRootCategories());
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return new ResponseEntity<>(service.createCategory(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable int id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(service.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategoryById(@PathVariable int id) {
        service.deleteCategoryById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
