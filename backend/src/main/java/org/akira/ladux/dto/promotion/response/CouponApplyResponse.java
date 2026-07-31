package org.akira.ladux.dto.promotion.response;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

import org.akira.ladux.model.enums.DiscountType;

import org.akira.ladux.dto.promotion.response.CouponResponse;
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
    public static CouponApplyResponse fromEntity(CouponResponse coupon) {
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
