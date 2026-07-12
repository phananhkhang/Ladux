package org.akira.ladux.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.akira.ladux.model.enums.DiscountType;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "coupons")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType discountType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    private Integer usageLimit;

    @Builder.Default
    @Column(nullable = false)
    private int usedCount = 0;

    @Column(nullable = false)
    private Instant expiresAt;

    @OneToMany(mappedBy = "coupon")
    @ToString.Exclude
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private Instant updateAt;

    // ===== Domain logic dung chung cho preview (applyCoupon) va commit (redeem) =====

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    /** Coupon het han khi thoi diem het han khong con o tuong lai. */
    public boolean isExpired() {
        return !expiresAt.isAfter(Instant.now());
    }

    /** Het luot su dung khi co gioi han va so lan da dung da cham nguong. */
    public boolean isUsageLimitReached() {
        return usageLimit != null && usedCount >= usageLimit;
    }

    /** Don hang chua dat gia tri toi thieu de duoc ap coupon. */
    public boolean isBelowMinOrderValue(BigDecimal subTotal) {
        BigDecimal min = minOrderValue == null ? BigDecimal.ZERO : minOrderValue;
        return subTotal.compareTo(min) < 0;
    }

    /** Tinh so tien duoc giam, khong vuot qua subTotal, lam tron 2 chu so. */
    public BigDecimal calculateDiscount(BigDecimal subTotal) {
        BigDecimal discount = discountType == DiscountType.PERCENT
                ? subTotal.multiply(discountValue).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
                : discountValue;
        return discount.min(subTotal).setScale(2, RoundingMode.HALF_UP);
    }
}
