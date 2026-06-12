package org.akira.auratech.dto.response;

import org.akira.auratech.model.enums.DiscountType;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

public record CouponApplyResponse(
        Integer id,
        String code,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderValue,
        Integer usageLimit,
        int usedCount,
        Instant expiresAt,
        BigDecimal discountAmount
) implements Serializable {
    public static CouponApplyResponse from(CouponResponse coupon, BigDecimal discountAmount) {
        if (coupon == null) {
            return null;
        }
        return new CouponApplyResponse(
                coupon.id(),
                coupon.code(),
                coupon.discountType(),
                coupon.discountValue(),
                coupon.minOrderValue(),
                coupon.usageLimit(),
                coupon.usedCount(),
                coupon.expiresAt(),
                discountAmount
        );
    }
}
