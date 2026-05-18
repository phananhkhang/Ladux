package org.akira.auratech.dto.response;

import org.akira.auratech.model.Payment;
import org.akira.auratech.model.enums.PaymentProvider;
import org.akira.auratech.model.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentResponse(
        Integer id,
        Integer orderId,
        PaymentProvider provider,
        String transactionNo,
        BigDecimal amount,
        PaymentStatus status,
        Instant createdAt
) {
    public static PaymentResponse fromEntity(Payment payment) {
        if (payment == null) {
            return null;
        }
        return new PaymentResponse(
                payment.getId(),
                payment.getOrder() == null ? null : payment.getOrder().getId(),
                payment.getProvider(),
                payment.getTransactionNo(),
                payment.getAmount(),
                payment.getStatus(),
                payment.getCreatedAt()
        );
    }
}
