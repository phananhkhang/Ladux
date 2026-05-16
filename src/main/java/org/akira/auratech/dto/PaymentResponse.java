package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentProvider;
import org.akira.auratech.model.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
public class PaymentResponse {
    private Integer id;
    private Integer orderId;
    private PaymentProvider provider;
    private String transactionNo;
    private BigDecimal amount;
    private PaymentStatus status;
    private Instant createdAt;

    public static PaymentResponse fromEntity(Payment payment) {
        if (payment == null) {
            return null;
        }
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() == null ? null : payment.getOrder().getId())
                .provider(payment.getProvider())
                .transactionNo(payment.getTransactionNo())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}

