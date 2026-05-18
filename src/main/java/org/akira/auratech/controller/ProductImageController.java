package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ProductImageRequest;
import org.akira.auratech.dto.response.ProductImageResponse;
import org.akira.auratech.service.ProductImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/product-images")
@RequiredArgsConstructor
public class ProductImageController {
    private final ProductImageService service;

    @GetMapping
    public ResponseEntity<List<ProductImageResponse>> getAllProductImages() {
        return ResponseEntity.ok(service.getAllProductImages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductImageResponse> getProductImageById(@PathVariable int id) {
        return ResponseEntity.ok(service.getProductImageById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductImageResponse>> getProductImagesByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(service.getProductImagesByProductId(productId));
    }

    @GetMapping("/product/{productId}/primary")
    public ResponseEntity<List<ProductImageResponse>> getPrimaryProductImagesByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(service.getPrimaryProductImagesByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<ProductImageResponse> createProductImage(@Valid @RequestBody ProductImageRequest request) {
        return new ResponseEntity<>(service.createProductImage(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductImageResponse> updateProductImage(@PathVariable int id, @Valid @RequestBody ProductImageRequest request) {
        return ResponseEntity.ok(service.updateProductImage(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductImageById(@PathVariable int id) {
        service.deleteProductImageById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
