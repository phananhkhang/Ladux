package org.akira.auratech.dto.response;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

import org.akira.auratech.model.enums.DiscountType;

public record CouponApplyResponse(
        Integer id,
        String code,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderValue,
        Integer usageLimit,
        int usedCount,
        Instant expiresAt
) implements Serializable {
    public static CouponApplyResponse from(CouponResponse coupon) {
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
                coupon.expiresAt()
        );
    }
}
