package org.akira.ladux.controller.user;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.response.ProductImageResponse;
import org.akira.ladux.service.ProductImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products/{productId}/images")
@RequiredArgsConstructor
@Validated
public class ProductImageController {
    private final ProductImageService service;

    @GetMapping
    public ResponseEntity<List<ProductImageResponse>> getProductImagesByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(service.getProductImagesByProductId(productId));
    }
}