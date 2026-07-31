package org.akira.ladux.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.admin.CouponApplyRequest;
import org.akira.ladux.dto.response.user.CouponApplyResponse;
import org.akira.ladux.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService service;

    @PostMapping("/apply")
    public ResponseEntity<CouponApplyResponse> applyCoupon(@Valid @RequestBody CouponApplyRequest request) {
        return ResponseEntity.ok(service.applyCoupon(request));
    }
}