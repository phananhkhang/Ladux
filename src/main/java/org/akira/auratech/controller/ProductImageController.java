package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.ProductImageRequest;
import org.akira.auratech.dto.ProductImageResponse;
import org.akira.auratech.service.ProductImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-images")
@RequiredArgsConstructor
public class ProductImageController {
    private final ProductImageService service;

    @GetMapping
    public List<ProductImageResponse> getAllProductImages() {
        return service.getAllProductImages();
    }

    @GetMapping("/{id}")
    public ProductImageResponse getProductImageById(@PathVariable int id) {
        return service.getProductImageById(id);
    }

    @GetMapping("/product/{productId}")
    public List<ProductImageResponse> getProductImagesByProductId(@PathVariable int productId) {
        return service.getProductImagesByProductId(productId);
    }

    @GetMapping("/product/{productId}/primary")
    public List<ProductImageResponse> getPrimaryProductImagesByProductId(@PathVariable int productId) {
        return service.getPrimaryProductImagesByProductId(productId);
    }

    @PostMapping
    public ResponseEntity<ProductImageResponse> createProductImage(@Valid @RequestBody ProductImageRequest request) {
        return ResponseEntity.ok(service.createProductImage(request));
    }

    @PutMapping("/{id}")
    public ProductImageResponse updateProductImage(@PathVariable int id, @RequestBody ProductImageRequest request) {
        return service.updateProductImage(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteProductImageById(@PathVariable int id) {
        service.deleteProductImageById(id);
    }
}
