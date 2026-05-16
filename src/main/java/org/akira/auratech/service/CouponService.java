package org.akira.auratech.service;

import org.akira.auratech.model.Coupon;

import java.util.List;

public interface CouponService {
    List<Coupon> getAllCoupons();

    Coupon getCouponById(int id);

    Coupon getCouponByCode(String code);

    Coupon createCoupon(Coupon coupon);

    Coupon updateCoupon(Coupon coupon);

    void deleteCouponById(int id);
}
