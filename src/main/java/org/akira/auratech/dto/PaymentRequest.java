package org.akira.auratech.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.enums.PaymentProvider;
import org.akira.auratech.model.enums.PaymentStatus;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentRequest {
    @NotNull(message = "OrderId khong duoc de trong")
    private Integer orderId;

    @NotNull(message = "Provider khong duoc de trong")
    private PaymentProvider provider;

    private String transactionNo;

    @NotNull(message = "Amount khong duoc de trong")
    private BigDecimal amount;

    private PaymentStatus status;
}

