package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;
import org.akira.auratech.model.enums.PaymentProvider;

public record PaymentRetryRequest(
        @NotNull(message = "Provider khong duoc de trong")
        PaymentProvider provider
) {}
