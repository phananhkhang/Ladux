package org.akira.auratech.controller.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.response.ProductImageResponse;
import org.akira.auratech.service.ProductImageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/products/{productId}/images")
@RequiredArgsConstructor
@Validated
public class AdminProductImageController {
    private final ProductImageService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductImageResponse>> addSecondaryImages(
            @PathVariable int productId,
            @RequestBody @NotEmpty(message = "Danh sach anh khong duoc de trong")
            List<@NotBlank(message = "ImageUrl khong duoc de trong") @Size(max = 255, message = "ImageUrl khong duoc vuot qua 255 ky tu") String> imageUrls
    ) {
        return new ResponseEntity<>(service.addImages(productId, imageUrls), HttpStatus.CREATED);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductImageResponse> uploadProductImage(
            @PathVariable int productId,
            @RequestPart("file") MultipartFile file
    ) {
        return new ResponseEntity<>(service.uploadImage(productId, file), HttpStatus.CREATED);
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductImageById(@PathVariable int productId, @PathVariable int imageId) {
        service.deleteProductImageById(productId, imageId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}