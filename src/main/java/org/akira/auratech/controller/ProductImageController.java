package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.ProductImageRequest;
import org.akira.auratech.dto.response.ProductImageResponse;
import org.akira.auratech.service.ProductImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products/{productId}/images")
@RequiredArgsConstructor
public class ProductImageController {
    private final ProductImageService service;

    @GetMapping
    public ResponseEntity<List<ProductImageResponse>> getProductImagesByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(service.getProductImagesByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<List<ProductImageResponse>> addSecondaryImages(
            @PathVariable int productId,
            @Valid @RequestBody ProductImageRequest request
    ) {
        return new ResponseEntity<>(service.addImages(productId, request), HttpStatus.CREATED);
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteProductImageById(@PathVariable int productId, @PathVariable int imageId) {
        service.deleteProductImageById(productId, imageId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
