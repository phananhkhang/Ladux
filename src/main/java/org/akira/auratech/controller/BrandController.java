package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.BrandRequest;
import org.akira.auratech.dto.response.BrandResponse;
import org.akira.auratech.service.BrandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService service;

    @GetMapping
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        return ResponseEntity.ok(service.getAllBrands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponse> getBrandById(@PathVariable int id) {
        return ResponseEntity.ok(service.getBrandById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<BrandResponse> getBrandByName(@PathVariable String name) {
        return ResponseEntity.ok(service.getBrandByName(name));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<BrandResponse> getBrandBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.getBrandBySlug(slug));
    }

    @PostMapping
    public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody BrandRequest request) {
        BrandResponse response = service.createBrand(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrandById(@PathVariable int id) {
        service.deleteBrandById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandResponse> updateBrand(@PathVariable int id, @Valid @RequestBody BrandRequest brand) {
        BrandResponse response = service.updateBrand(id, brand);
        return ResponseEntity.ok(response);
    }
}
