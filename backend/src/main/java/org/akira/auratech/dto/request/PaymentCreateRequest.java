package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.akira.auratech.model.enums.PaymentProvider;

public record PaymentCreateRequest(
        @NotNull(message = "OrderId khong duoc de trong")
        @Positive(message = "OrderId phai la so duong")
        Integer orderId,

        @NotNull(message = "Provider khong duoc de trong")
        PaymentProvider provider
) {}
