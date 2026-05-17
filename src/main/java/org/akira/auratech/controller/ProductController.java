package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.ProductRequest;
import org.akira.auratech.dto.ProductResponse;
import org.akira.auratech.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService service;

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable int id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.getProductBySlug(slug));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponse> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(service.getProductBySku(sku));
    }

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<List<ProductResponse>> getProductsByBrandId(@PathVariable int brandId) {
        return ResponseEntity.ok(service.getProductsByBrandId(brandId));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategoryId(@PathVariable int categoryId) {
        return ResponseEntity.ok(service.getProductsByCategoryId(categoryId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductResponse>> getActiveProducts() {
        return ResponseEntity.ok(service.getActiveProducts());
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return new ResponseEntity<>(service.createProduct(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable int id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(service.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductById(@PathVariable int id) {
        service.deleteProductById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
