package org.akira.auratech.service.impl;

import java.math.BigDecimal;

import org.akira.auratech.dto.CouponRedemptionResult;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.service.CouponRedemptionService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponRedemptionServiceImpl implements CouponRedemptionService {
    private final CouponRepository couponRepository;

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    @CacheEvict(value = "coupons", allEntries = true)
    public CouponRedemptionResult redeem(String couponCode, BigDecimal subTotal) {
        if (couponCode == null || couponCode.isBlank()) {
            return CouponRedemptionResult.empty();
        }

        Coupon coupon = couponRepository.findByCodeForUpdate(couponCode)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi code = " + couponCode));

        validateCoupon(coupon, subTotal);

        BigDecimal discountAmount = coupon.calculateDiscount(subTotal);
        coupon.setUsedCount(coupon.getUsedCount() + 1);

        return new CouponRedemptionResult(coupon, discountAmount);
    }

    private void validateCoupon(Coupon coupon, BigDecimal subTotal) {
        if (coupon.isExpired()) {
            throw new BusinessRuleException("Coupon da het han");
        }
        if (coupon.isUsageLimitReached()) {
            throw new BusinessRuleException("Coupon da het luot su dung");
        }
        if (coupon.isBelowMinOrderValue(subTotal)) {
            throw new BusinessRuleException("Don hang chua dat gia tri toi thieu cua coupon");
        }
    }
}

