package org.akira.ladux.controller.admin;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.ProductVariantRequest;
import org.akira.ladux.dto.response.ProductVariantResponse;
import org.akira.ladux.service.ProductVariantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/product-variants")
@RequiredArgsConstructor
public class AdminProductVariantController {
    private final ProductVariantService service;
    // Thêm ProductVariant
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductVariantResponse> addProductVariant(@RequestBody ProductVariantRequest request) {
        ProductVariantResponse response = service.addProductVariant(
                    request.getProductId(),
                    request.getColorId(),
                    request.getRam(),
                    request.getRom(),
                    request.getPrice(),
                    request.getDiscountPrice(),
                    request.getStockQuantity(),
                    request.isActive()
        );
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductVariantResponse> updateProductVariant(@PathVariable Integer id, @RequestBody ProductVariantRequest request) {
        ProductVariantResponse response = service.updateProductVariant(
                id,
                request.getColorId(),
                request.getRam(),
                request.getRom(),
                request.getPrice(),
                request.getDiscountPrice(),
                request.getStockQuantity(),
                request.isActive()
        );
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProductVariant(@PathVariable Integer variantId) {
        service.deleteProductVariant(variantId);
        return ResponseEntity.noContent().build();
    }
}
