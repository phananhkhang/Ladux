package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record OrderHistoryRequest(
        @NotNull(message = "OrderId khong duoc de trong")
        @Positive(message = "OrderId phai la so duong")
        Integer orderId,

        @NotBlank(message = "Status khong duoc de trong")
        @Size(max = 20, message = "Status khong duoc vuot qua 20 ky tu")
        String status,

        @Size(max = 2000, message = "Description khong duoc vuot qua 2000 ky tu")
        String description
) {}
