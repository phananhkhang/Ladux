package org.akira.ladux.dto.response.common;

import org.akira.ladux.model.Coupon;
import org.akira.ladux.model.enums.DiscountType;
import java.io.Serializable;
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
) implements Serializable {
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
