package org.akira.ladux.service;

import org.akira.ladux.dto.promotion.request.CouponAdminRequest;
import org.akira.ladux.dto.promotion.request.CouponApplyRequest;
import org.akira.ladux.dto.promotion.response.CouponApplyResponse;
import org.akira.ladux.dto.promotion.response.CouponResponse;
import org.akira.ladux.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CouponService {
    PageResponse<CouponResponse> getAllCoupons(Pageable pageable);

    CouponResponse getCouponById(int id);

    CouponResponse getCouponByCode(String code);

    CouponResponse createCoupon(CouponAdminRequest request);

    CouponResponse updateCoupon(int id, CouponAdminRequest request);

    void deleteCouponById(int id);

    CouponApplyResponse applyCoupon(CouponApplyRequest request);
}
