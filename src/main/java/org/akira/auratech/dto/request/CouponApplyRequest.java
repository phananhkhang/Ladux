package org.akira.auratech.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.akira.auratech.model.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponApplyRequest(
        @NotBlank(message = "Code khong duoc de trong")
        @Size(max = 50, message = "Code khong duoc vuot qua 50 ky tu")
        String code
) {}
