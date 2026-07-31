package org.akira.ladux.dto.system.response;

import org.akira.ladux.model.Payment;
import org.akira.ladux.model.enums.PaymentProvider;
import org.akira.ladux.model.enums.PaymentStatus;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

public record PaymentCallbackResponse(
        Integer id,
        Integer orderId,
        PaymentProvider provider,
        String transactionNo,
        BigDecimal amount,
        PaymentStatus status,
        Instant createdAt
) implements Serializable {
    public static PaymentCallbackResponse fromEntity(Payment payment) {
        if (payment == null) {
            return null;
        }
        return new PaymentCallbackResponse(
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
