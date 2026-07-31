package org.akira.ladux.service;

import org.akira.ladux.dto.request.admin.CouponAdminRequest;
import org.akira.ladux.dto.request.admin.CouponApplyRequest;
import org.akira.ladux.dto.response.user.CouponApplyResponse;
import org.akira.ladux.dto.response.common.CouponResponse;
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
