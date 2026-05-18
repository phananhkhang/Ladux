package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;
import org.akira.auratech.model.enums.PaymentProvider;
import org.akira.auratech.model.enums.PaymentStatus;
import java.math.BigDecimal;

public record PaymentRequest(
        @NotNull(message = "OrderId khong duoc de trong")
        Integer orderId,
        @NotNull(message = "Provider khong duoc de trong")
        PaymentProvider provider,
        String transactionNo,
        @NotNull(message = "Amount khong duoc de trong")
        BigDecimal amount,
        PaymentStatus status
) {}
