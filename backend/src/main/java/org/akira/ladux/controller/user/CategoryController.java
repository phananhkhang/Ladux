package org.akira.ladux.controller.user;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.catalog.response.CategoryResponse;
import org.akira.ladux.service.CategoryService;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;

    @GetMapping
    public ResponseEntity<PageResponse<CategoryResponse>> getAllCategories(Pageable pageable) {
        return ResponseEntity.ok(service.getAllCategories(pageable));
    }
}