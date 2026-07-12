package org.akira.ladux.controller.user;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.response.ProductResponse;
import org.akira.ladux.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService service;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(value = "search", required = false) String search,
            Pageable pageable
    ) {
        if (search == null || search.isBlank()) {
            return ResponseEntity.ok(service.getAllProducts(pageable));
        }
        return ResponseEntity.ok(service.searchProducts(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable int id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<Page<ProductResponse>> getProductsByBrandId(@PathVariable int brandId, Pageable pageable) {
        return ResponseEntity.ok(service.getProductsByBrandId(brandId, pageable));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategoryId(@PathVariable int categoryId, Pageable pageable) {
        return ResponseEntity.ok(service.getProductsByCategoryId(categoryId, pageable));
    }
    @GetMapping("/active")
    public ResponseEntity<Page<ProductResponse>> getActiveProducts(Pageable pageable) {
        return ResponseEntity.ok(service.getActiveProducts(pageable));
    }
}