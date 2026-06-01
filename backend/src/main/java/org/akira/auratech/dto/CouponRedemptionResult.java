package org.akira.auratech.dto;

import org.akira.auratech.model.Coupon;

import java.math.BigDecimal;

public record CouponRedemptionResult(Coupon coupon, BigDecimal discountAmount) {
    public static CouponRedemptionResult empty() {
        return new CouponRedemptionResult(null, BigDecimal.ZERO);
    }
}

