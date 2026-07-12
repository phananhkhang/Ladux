package org.akira.ladux.service;

import org.akira.ladux.dto.CouponRedemptionResult;

import java.math.BigDecimal;

public interface CouponRedemptionService {
    CouponRedemptionResult redeem(String couponCode, BigDecimal subTotal);
}

