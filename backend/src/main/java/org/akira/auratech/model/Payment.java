package org.akira.auratech.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.akira.auratech.model.enums.PaymentProvider;
import org.akira.auratech.model.enums.PaymentStatus;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "payments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @ToString.Exclude
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentProvider provider;

    /**
     * Ma giao dich tu Gateway (gateway_transaction_no), vi du vnp_TransactionNo.
     * Luu de doi soat va CSKH tra cuu. Unique khi NOT NULL (xem migration V7).
     */
    @Column(name = "transaction_no")
    private String transactionNo;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private Instant updateAt;
}
