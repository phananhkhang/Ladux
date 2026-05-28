package org.akira.auratech.dto.response;

import org.akira.auratech.model.Coupon;
import org.akira.auratech.model.enums.DiscountType;
import java.math.BigDecimal;
import java.time.Instant;

public record CouponResponse(
        Integer id,
        String code,
        DiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minOrderValue,
        Integer usageLimit,
        int usedCount,
        Instant expiresAt
) {
    public static CouponResponse fromEntity(Coupon coupon) {
        if (coupon == null) {
            return null;
        }
        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinOrderValue(),
                coupon.getUsageLimit(),
                coupon.getUsedCount(),
                coupon.getExpiresAt()
        );
    }
}
