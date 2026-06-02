package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CouponApplyRequest(
        @NotBlank(message = "Code khong duoc de trong")
        @Size(max = 50, message = "Code khong duoc vuot qua 50 ky tu")
        String code,

        @PositiveOrZero(message = "SubTotal phai lon hon hoac bang 0")
        BigDecimal subTotal
) {}
