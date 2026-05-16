package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CouponRequest;
import org.akira.auratech.dto.CouponResponse;
import org.akira.auratech.model.Coupon;
import org.akira.auratech.repository.CouponRepository;
import org.akira.auratech.service.CouponService;
import org.springframework.stereotype.Service;

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
        return CouponResponse.fromEntity(repo.findById(id).orElse(null));
    }

    @Override
    public CouponResponse getCouponByCode(String code) {
        return CouponResponse.fromEntity(repo.findByCode(code));
    }

    @Override
    public CouponResponse createCoupon(CouponRequest request) {
        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .usageLimit(request.getUsageLimit())
                .usedCount(request.getUsedCount() == null ? 0 : request.getUsedCount())
                .expiresAt(request.getExpiresAt())
                .build();
        return CouponResponse.fromEntity(repo.save(coupon));
    }

    @Override
    public CouponResponse updateCoupon(int id, CouponRequest request) {
        Coupon coupon = repo.findById(id).orElse(null);
        if (coupon == null) {
            return null;
        }
        if (request.getCode() != null) {
            coupon.setCode(request.getCode());
        }
        if (request.getDiscountType() != null) {
            coupon.setDiscountType(request.getDiscountType());
        }
        if (request.getDiscountValue() != null) {
            coupon.setDiscountValue(request.getDiscountValue());
        }
        if (request.getMinOrderValue() != null) {
            coupon.setMinOrderValue(request.getMinOrderValue());
        }
        if (request.getUsageLimit() != null) {
            coupon.setUsageLimit(request.getUsageLimit());
        }
        if (request.getUsedCount() != null) {
            coupon.setUsedCount(request.getUsedCount());
        }
        if (request.getExpiresAt() != null) {
            coupon.setExpiresAt(request.getExpiresAt());
        }
        return CouponResponse.fromEntity(repo.save(coupon));
    }

    @Override
    public void deleteCouponById(int id) {
        repo.deleteById(id);
    }
}
