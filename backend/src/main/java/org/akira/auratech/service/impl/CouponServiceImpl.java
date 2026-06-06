package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CouponAdminRequest;
import org.akira.auratech.dto.request.CouponApplyRequest;
import org.akira.auratech.dto.response.CouponApplyResponse;
import org.akira.auratech.dto.response.CouponResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.model.enums.DiscountType;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.service.CouponService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
    private final CouponRepository repo;

    @Override
    @Transactional(readOnly = true)
    public Page<CouponResponse> getAllCoupons(Pageable pageable) {
        return repo.findAll(pageable)
                .map(CouponResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponById(int id) {
        return CouponResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public CouponResponse getCouponByCode(String code) {
        return CouponResponse.fromEntity(repo.findByCode(code));
    }

    @Override
    @Transactional
    public CouponResponse createCoupon(CouponAdminRequest request) {
        validateCouponDefinition(request.discountType(), request.discountValue());
        Coupon coupon = Coupon.builder()
                .code(request.code())
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .minOrderValue(request.minOrderValue() == null ? BigDecimal.ZERO : request.minOrderValue())
                .usageLimit(request.usageLimit())
                .usedCount(0)
                .expiresAt(request.expiresAt())
                .build();
        return CouponResponse.fromEntity(repo.save(coupon));
    }

    @Override
    @Transactional
    public CouponResponse updateCoupon(int id, CouponAdminRequest request) {
        Coupon coupon = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + id));
        DiscountType nextType = request.discountType() == null ? coupon.getDiscountType() : request.discountType();
        BigDecimal nextValue = request.discountValue() == null ? coupon.getDiscountValue() : request.discountValue();
        validateCouponDefinition(nextType, nextValue);
        if (request.code() != null) {
            coupon.setCode(request.code());
        }
        if (request.discountType() != null) {
            coupon.setDiscountType(request.discountType());
        }
        if (request.discountValue() != null) {
            coupon.setDiscountValue(request.discountValue());
        }
        if (request.minOrderValue() != null) {
            coupon.setMinOrderValue(request.minOrderValue());
        }
        if (request.usageLimit() != null) {
            coupon.setUsageLimit(request.usageLimit());
        }
        if (request.expiresAt() != null) {
            coupon.setExpiresAt(request.expiresAt());
        }
        return CouponResponse.fromEntity(coupon);
    }

    @Override
    @Transactional
    public void deleteCouponById(int id) {
        repo.deleteById(id);
    }

    private void validateCouponDefinition(DiscountType discountType, BigDecimal discountValue) {
        if (discountType == DiscountType.PERCENT
                && discountValue != null
                && discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessRuleException("Coupon PERCENT khong duoc vuot qua 100%");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CouponApplyResponse applyCoupon(CouponApplyRequest request) {
        if (request == null || request.code() == null || request.code().isBlank()) {
            throw new BusinessRuleException("Ma coupon khong hop le");
        }
        Coupon coupon = repo.findByCode(request.code());
        if (coupon == null) {
            throw new ResourceNotFoundException("Khong tim thay coupon voi code = " + request.code());
        }
        if (!coupon.getExpiresAt().isAfter(Instant.now())) {
            throw new BusinessRuleException("Coupon da het han");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BusinessRuleException("Coupon da het luot su dung");
        }
        BigDecimal subTotal = request.subTotal() != null ? request.subTotal() : BigDecimal.ZERO;
        BigDecimal minOrderValue = coupon.getMinOrderValue() == null ? BigDecimal.ZERO : coupon.getMinOrderValue();
        if (subTotal.compareTo(minOrderValue) < 0) {
            throw new BusinessRuleException("Don hang chua dat gia tri toi thieu cua coupon");
        }
        BigDecimal discountAmount = calculateDiscount(coupon, subTotal);
        CouponResponse base = CouponResponse.fromEntity(coupon);
        return CouponApplyResponse.from(base, discountAmount);
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subTotal) {
        BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
        BigDecimal discount = coupon.getDiscountType() == DiscountType.PERCENT
                ? subTotal.multiply(coupon.getDiscountValue()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
                : coupon.getDiscountValue();
        return discount.min(subTotal).setScale(2, RoundingMode.HALF_UP);
    }
}
