package org.akira.ladux.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import org.akira.ladux.model.enums.OrderStatus;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

// Don hang — aggregate root cua luong checkout.
// Tien te: subTotal (truoc giam), discountAmount, finalAmount (sau giam).
// Gia tung dong snapshot tren OrderItem.priceAtPurchase.
// paymentExpiresAt: han thanh toan (null voi COD). Cascade ALL + orphanRemoval cho items, histories, payments.
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EnableJpaAuditing
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    @ToString.Exclude
    private Coupon coupon;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subTotal;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Embedded
    private ShippingAddress shippingAddress;

    private String trackingNumber;

    private String carrierName;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "shipping_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal shippingFee;

    private Instant paymentExpiresAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<OrderHistory> histories = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();
}
