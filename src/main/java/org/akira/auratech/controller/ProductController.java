package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.ProductRequest;
import org.akira.auratech.dto.ProductResponse;
import org.akira.auratech.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService service;

    @GetMapping
    public List<ProductResponse> getAllProducts() {
        return service.getAllProducts();
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable int id) {
        return service.getProductById(id);
    }

    @GetMapping("/slug/{slug}")
    public ProductResponse getProductBySlug(@PathVariable String slug) {
        return service.getProductBySlug(slug);
    }

    @GetMapping("/sku/{sku}")
    public ProductResponse getProductBySku(@PathVariable String sku) {
        return service.getProductBySku(sku);
    }

    @GetMapping("/brand/{brandId}")
    public List<ProductResponse> getProductsByBrandId(@PathVariable int brandId) {
        return service.getProductsByBrandId(brandId);
    }

    @GetMapping("/category/{categoryId}")
    public List<ProductResponse> getProductsByCategoryId(@PathVariable int categoryId) {
        return service.getProductsByCategoryId(categoryId);
    }

    @GetMapping("/active")
    public List<ProductResponse> getActiveProducts() {
        return service.getActiveProducts();
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(service.createProduct(request));
    }

    @PutMapping("/{id}")
    public ProductResponse updateProduct(@PathVariable int id, @RequestBody ProductRequest request) {
        return service.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteProductById(@PathVariable int id) {
        service.deleteProductById(id);
    }
}
