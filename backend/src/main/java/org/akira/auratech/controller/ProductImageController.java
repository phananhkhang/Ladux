package org.akira.auratech.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.ProductImageResponse;
import org.akira.auratech.service.ProductImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
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
@Validated
public class ProductImageController {
    private final ProductImageService service;

    @GetMapping
    public ResponseEntity<List<ProductImageResponse>> getProductImagesByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(service.getProductImagesByProductId(productId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductImageResponse>> addSecondaryImages(
            @PathVariable int productId,
            @RequestBody @NotEmpty(message = "Danh sach anh khong duoc de trong")
            List<@NotBlank(message = "ImageUrl khong duoc de trong") @Size(max = 255, message = "ImageUrl khong duoc vuot qua 255 ky tu") String> imageUrls
    ) {
        return new ResponseEntity<>(service.addImages(productId, imageUrls), HttpStatus.CREATED);
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductImageById(@PathVariable int productId, @PathVariable int imageId) {
        service.deleteProductImageById(productId, imageId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
