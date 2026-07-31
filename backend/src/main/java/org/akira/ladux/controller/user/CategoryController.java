package org.akira.ladux.controller.user;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.catalog.response.CategoryResponse;
import org.akira.ladux.service.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;

    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getAllCategories(Pageable pageable) {
        return ResponseEntity.ok(service.getAllCategories(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable int id) {
        return ResponseEntity.ok(service.getCategoryById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<CategoryResponse> getCategoryByName(@PathVariable String name) {
        return ResponseEntity.ok(service.getCategoryByName(name));
    }

    @GetMapping("/roots")
    public ResponseEntity<Page<CategoryResponse>> getRootCategories(Pageable pageable) {
        return ResponseEntity.ok(service.getRootCategories(pageable));
    }
}