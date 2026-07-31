package org.akira.ladux.service.impl;

import java.math.BigDecimal;

import org.akira.ladux.dto.request.admin.CouponAdminRequest;
import org.akira.ladux.dto.request.admin.CouponApplyRequest;
import org.akira.ladux.dto.response.user.CouponApplyResponse;
import org.akira.ladux.dto.response.common.CouponResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Coupon;
import org.akira.ladux.model.enums.DiscountType;
import org.akira.ladux.repository.CouponRepository;
import org.akira.ladux.service.CouponService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
    private final CouponRepository repo;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "coupons", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<CouponResponse> getAllCoupons(Pageable pageable) {
        return repo.findAll(pageable)
                .map(CouponResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "coupons", key = "'id:' + #id")
    public CouponResponse getCouponById(int id) {
        return CouponResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "coupons", key = "'code:' + #code")
    public CouponResponse getCouponByCode(String code) {
        return CouponResponse.fromEntity(repo.findByCode(code));
    }

    @Override
    @Transactional
    @CacheEvict(value = "coupons", allEntries = true)
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
    @CacheEvict(value = "coupons", allEntries = true)
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
    @CacheEvict(value = "coupons", allEntries = true)
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
        if (coupon.isExpired()) {
            throw new BusinessRuleException("Coupon da het han");
        }
        if (coupon.isUsageLimitReached()) {
            throw new BusinessRuleException("Coupon da het luot su dung");
        }
        return CouponApplyResponse.fromEntity(CouponResponse.fromEntity(coupon));
    }
}
