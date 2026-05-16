package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.BrandRequest;
import org.akira.auratech.dto.BrandResponse;
import org.akira.auratech.service.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService service;

    @GetMapping
    public List<BrandResponse> getAllBrands() {
        return service.getAllBrands();
    }

    @GetMapping("/{id}")
    public BrandResponse getBrandById(@PathVariable int id) {
        return service.getBrandById(id);
    }

    @GetMapping("/name/{name}")
    public BrandResponse getBrandByName(@PathVariable String name) {
        return service.getBrandByName(name);
    }

    @GetMapping("/slug/{slug}")
    public BrandResponse getBrandBySlug(@PathVariable String slug) {
        return service.getBrandBySlug(slug);
    }

    @PostMapping
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody BrandRequest request) {
        BrandResponse response = service.createBrand(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public void deleteBrandById(@PathVariable int id) {
        service.deleteBrandById(id);
    }

    @PutMapping("/{id}")
    public BrandResponse updateBrand(@PathVariable int id, @RequestBody BrandRequest brand) {
        return service.updateBrand(id, brand);
    }
}
