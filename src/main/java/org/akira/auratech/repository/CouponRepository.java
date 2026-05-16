package org.akira.auratech.repository;

import org.akira.auratech.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    Coupon findByCode(String code);
}

