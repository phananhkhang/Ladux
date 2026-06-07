package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CouponRedemptionResult;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.model.enums.DiscountType;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.service.CouponRedemptionService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CouponRedemptionServiceImpl implements CouponRedemptionService {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private final CouponRepository couponRepository;

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    @CacheEvict(value = "coupons", allEntries = true)
    public CouponRedemptionResult redeem(String couponCode, BigDecimal subTotal) {
        if (couponCode == null || couponCode.isBlank()) {
            return CouponRedemptionResult.empty();
        }

        Coupon coupon = couponRepository.findByCodeForUpdate(couponCode)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + couponCode));

        validateCoupon(coupon, subTotal);

        BigDecimal discountAmount = calculateDiscount(coupon, subTotal);
        coupon.setUsedCount(coupon.getUsedCount() + 1);

        return new CouponRedemptionResult(coupon, discountAmount);
    }

    private void validateCoupon(Coupon coupon, BigDecimal subTotal) {
        if (!coupon.getExpiresAt().isAfter(Instant.now())) {
            throw new BusinessRuleException("Coupon da het han");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BusinessRuleException("Coupon da het luot su dung");
        }
        BigDecimal minOrderValue = coupon.getMinOrderValue() == null ? BigDecimal.ZERO : coupon.getMinOrderValue();
        if (subTotal.compareTo(minOrderValue) < 0) {
            throw new BusinessRuleException("Don hang chua dat gia tri toi thieu cua coupon");
        }
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subTotal) {
        BigDecimal discount = coupon.getDiscountType() == DiscountType.PERCENT
                ? subTotal.multiply(coupon.getDiscountValue()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
                : coupon.getDiscountValue();
        return discount.min(subTotal).setScale(2, RoundingMode.HALF_UP);
    }
}

