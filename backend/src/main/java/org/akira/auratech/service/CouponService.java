package org.akira.auratech.service;

import org.akira.auratech.dto.request.CouponAdminRequest;
import org.akira.auratech.dto.request.CouponApplyRequest;
import org.akira.auratech.dto.response.CouponApplyResponse;
import org.akira.auratech.dto.response.CouponResponse;

import java.util.List;

public interface CouponService {
    List<CouponResponse> getAllCoupons();

    CouponResponse getCouponById(int id);

    CouponResponse getCouponByCode(String code);

    CouponResponse createCoupon(CouponAdminRequest request);

    CouponResponse updateCoupon(int id, CouponAdminRequest request);

    void deleteCouponById(int id);

    CouponApplyResponse applyCoupon(CouponApplyRequest request);
}
