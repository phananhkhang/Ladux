package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;

public record CartRequest(
        @NotNull(message = "UserId khong duoc de trong")
        Integer userId
) {}
