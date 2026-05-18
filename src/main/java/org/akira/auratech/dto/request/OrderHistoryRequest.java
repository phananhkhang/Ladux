package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OrderHistoryRequest(
        @NotNull(message = "OrderId khong duoc de trong")
        Integer orderId,
        @NotBlank(message = "Status khong duoc de trong")
        String status,
        String description
) {}
