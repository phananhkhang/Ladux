package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CouponApplyRequest;
import org.akira.auratech.dto.response.CouponResponse;
import org.akira.auratech.service.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService service;

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return ResponseEntity.ok(service.getAllCoupons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable int id) {
        return ResponseEntity.ok(service.getCouponById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<CouponResponse> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(service.getCouponByCode(code));
    }

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponApplyRequest request) {
        return new ResponseEntity<>(service.createCoupon(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(@PathVariable int id, @Valid @RequestBody CouponApplyRequest request) {
        return ResponseEntity.ok(service.updateCoupon(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCouponById(@PathVariable int id) {
        service.deleteCouponById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
