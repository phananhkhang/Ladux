package org.akira.ladux.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.CategoryRequest;
import org.akira.ladux.dto.response.CategoryResponse;
import org.akira.ladux.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {
    private final CategoryService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return new ResponseEntity<>(service.createCategory(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable int id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(service.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategoryById(@PathVariable int id) {
        service.deleteCategoryById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @PostMapping("/uploads-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> uploadCategoryImage(@RequestParam("file") MultipartFile file) {
        service.uploadCategoryImage(file);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
