package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CouponApplyRequest;
import org.akira.auratech.dto.response.CouponResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.model.enums.DiscountType;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.service.CouponService;
import org.akira.auratech.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {
    private final CouponRepository repo;

    @Override
    public List<CouponResponse> getAllCoupons() {
        return repo.findAll().stream()
                .map(CouponResponse::fromEntity)
                .toList();
    }

    @Override
    public CouponResponse getCouponById(int id) {
        return CouponResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay coupon voi id = " + id)));
    }

    @Override
    public CouponResponse getCouponByCode(String code) {
        return CouponResponse.fromEntity(repo.findByCode(code));
    }

    @Override
    public CouponResponse createCoupon(CouponApplyRequest request) {
        validateCouponDefinition(request.discountType(), request.discountValue());
        Coupon coupon = Coupon.builder()
                .code(request.code())
                .discountType(request.discountType())
                .discountValue(request.discountValue())
                .minOrderValue(request.minOrderValue())
                .usageLimit(request.usageLimit())
                .usedCount(0)
                .expiresAt(request.expiresAt())
                .build();
        return CouponResponse.fromEntity(repo.save(coupon));
    }

    @Override
    public CouponResponse updateCoupon(int id, CouponApplyRequest request) {
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
        return CouponResponse.fromEntity(repo.save(coupon));
    }

    @Override
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
}
