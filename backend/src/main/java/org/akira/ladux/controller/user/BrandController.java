package org.akira.ladux.controller.user;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.catalog.response.BrandResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.akira.ladux.service.BrandService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService service;

    @GetMapping
    public ResponseEntity<PageResponse<BrandResponse>> getAllBrands(Pageable pageable) {
        return ResponseEntity.ok(service.getAllBrands(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponse> getBrandById(@PathVariable int id) {
        return ResponseEntity.ok(service.getBrandById(id));
    }
}