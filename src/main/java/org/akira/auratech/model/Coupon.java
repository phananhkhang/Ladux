package org.akira.auratech.model;

import jakarta.persistence.*;
import lombok.*;
import org.akira.auratech.model.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

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
}
