package org.akira.auratech.service;

import org.akira.auratech.dto.request.CouponAdminRequest;
import org.akira.auratech.dto.request.CouponApplyRequest;
import org.akira.auratech.dto.response.CouponApplyResponse;
import org.akira.auratech.dto.response.CouponResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CouponService {
    Page<CouponResponse> getAllCoupons(Pageable pageable);

    CouponResponse getCouponById(int id);

    CouponResponse getCouponByCode(String code);

    CouponResponse createCoupon(CouponAdminRequest request);

    CouponResponse updateCoupon(int id, CouponAdminRequest request);

    void deleteCouponById(int id);

    CouponApplyResponse applyCoupon(CouponApplyRequest request);
}
