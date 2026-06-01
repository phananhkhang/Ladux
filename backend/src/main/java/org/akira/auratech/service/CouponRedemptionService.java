package org.akira.auratech.service;

import org.akira.auratech.dto.CouponRedemptionResult;

import java.math.BigDecimal;

public interface CouponRedemptionService {
    CouponRedemptionResult redeem(String couponCode, BigDecimal subTotal);
}

