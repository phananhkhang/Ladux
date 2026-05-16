package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CouponRequest;
import org.akira.auratech.dto.CouponResponse;
import org.akira.auratech.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService service;

    @GetMapping
    public List<CouponResponse> getAllCoupons() {
        return service.getAllCoupons();
    }

    @GetMapping("/{id}")
    public CouponResponse getCouponById(@PathVariable int id) {
        return service.getCouponById(id);
    }

    @GetMapping("/code/{code}")
    public CouponResponse getCouponByCode(@PathVariable String code) {
        return service.getCouponByCode(code);
    }

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(service.createCoupon(request));
    }

    @PutMapping("/{id}")
    public CouponResponse updateCoupon(@PathVariable int id, @RequestBody CouponRequest request) {
        return service.updateCoupon(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteCouponById(@PathVariable int id) {
        service.deleteCouponById(id);
    }
}
