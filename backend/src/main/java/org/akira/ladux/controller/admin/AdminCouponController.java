package org.akira.ladux.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.promotion.request.CouponAdminRequest;
import org.akira.ladux.dto.promotion.response.CouponResponse;
import org.akira.ladux.service.CouponService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {
    private final CouponService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CouponResponse>> getAllCoupons(Pageable pageable) {
        return ResponseEntity.ok(service.getAllCoupons(pageable));
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
}
