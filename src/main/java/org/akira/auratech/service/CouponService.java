package org.akira.auratech.service;

import org.akira.auratech.dto.CouponRequest;
import org.akira.auratech.dto.CouponResponse;

import java.util.List;

public interface CouponService {
    List<CouponResponse> getAllCoupons();

    CouponResponse getCouponById(int id);

    CouponResponse getCouponByCode(String code);

    CouponResponse createCoupon(CouponRequest request);

    CouponResponse updateCoupon(int id, CouponRequest request);

    void deleteCouponById(int id);
}
