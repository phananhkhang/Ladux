package org.akira.auratech.dto;

import org.akira.auratech.model.Coupon;

import java.math.BigDecimal;

// Ket qua redeem coupon khi tao don — DTO noi bo giua CouponRedemptionService va OrderService.
public record CouponRedemptionResult(Coupon coupon, BigDecimal discountAmount) {
    // Khong nhap ma coupon — discount = 0, coupon = null.
    public static CouponRedemptionResult empty() {
        return new CouponRedemptionResult(null, BigDecimal.ZERO);
    }
}

