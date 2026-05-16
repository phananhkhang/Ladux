package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
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
    public List<Coupon> getAllCoupons() {
        return repo.findAll();
    }

    @Override
    public Coupon getCouponById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Coupon getCouponByCode(String code) {
        return repo.findByCode(code);
    }

    @Override
    public Coupon createCoupon(Coupon coupon) {
        return repo.save(coupon);
    }

    @Override
    public Coupon updateCoupon(Coupon coupon) {
        return repo.save(coupon);
    }

    @Override
    public void deleteCouponById(int id) {
        repo.deleteById(id);
    }
}

