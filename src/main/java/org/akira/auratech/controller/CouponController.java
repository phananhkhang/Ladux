package org.akira.auratech.controller;

import org.akira.auratech.model.Coupon;
import org.akira.auratech.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coupons")
public class CouponController {
    @Autowired
    CouponService service;

    @GetMapping("/all")
    public List<Coupon> getAllCoupons() {
        return service.getAllCoupons();
    }

    @GetMapping("/{id}")
    public Coupon getCouponById(@PathVariable int id) {
        return service.getCouponById(id);
    }

    @GetMapping("/code/{code}")
    public Coupon getCouponByCode(@PathVariable String code) {
        return service.getCouponByCode(code);
    }

    @PostMapping
    public Coupon createCoupon(@RequestBody Coupon coupon) {
        return service.createCoupon(coupon);
    }

    @PutMapping
    public Coupon updateCoupon(@RequestBody Coupon coupon) {
        return service.updateCoupon(coupon);
    }

    @DeleteMapping("/{id}")
    public void deleteCouponById(@PathVariable int id) {
        service.deleteCouponById(id);
    }
}

