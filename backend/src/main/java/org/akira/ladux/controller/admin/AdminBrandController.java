package org.akira.ladux.controller.admin;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.catalog.request.BrandRequest;
import org.akira.ladux.dto.catalog.response.BrandResponse;
import org.akira.ladux.service.BrandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/brands")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandService service;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody BrandRequest request) {
        BrandResponse response = service.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrandById(@PathVariable int id) {
        service.deleteBrandById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandResponse> updateBrand(@PathVariable int id, @Valid @RequestBody BrandRequest brand) {
        BrandResponse response = service.updateBrand(id, brand);
        return ResponseEntity.ok(response);
    }
}
