package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CouponAdminRequest;
import org.akira.auratech.dto.request.CouponApplyRequest;
import org.akira.auratech.dto.response.CouponApplyResponse;
import org.akira.auratech.dto.response.CouponResponse;
import org.akira.auratech.service.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return ResponseEntity.ok(service.getAllCoupons());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable int id) {
        return ResponseEntity.ok(service.getCouponById(id));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(service.getCouponByCode(code));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponAdminRequest request) {
        return new ResponseEntity<>(service.createCoupon(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> updateCoupon(@PathVariable int id, @Valid @RequestBody CouponAdminRequest request) {
        return ResponseEntity.ok(service.updateCoupon(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCouponById(@PathVariable int id) {
        service.deleteCouponById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Public endpoint for checkout preview (no auth required to compute discount)
    @PostMapping("/apply")
    public ResponseEntity<CouponApplyResponse> applyCoupon(@Valid @RequestBody CouponApplyRequest request) {
        return ResponseEntity.ok(service.applyCoupon(request));
    }
}
