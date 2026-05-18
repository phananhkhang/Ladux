package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CartRequest(
        @NotNull(message = "UserId khong duoc de trong")
        @Positive(message = "UserId phai la so duong")
        Integer userId
) {}
