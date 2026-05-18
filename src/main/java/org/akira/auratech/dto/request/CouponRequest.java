package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.akira.auratech.model.enums.DiscountType;
import java.math.BigDecimal;
import java.time.Instant;

public record CouponRequest(
        @NotBlank(message = "Code khong duoc de trong")
        String code,
        @NotNull(message = "DiscountType khong duoc de trong")
        DiscountType discountType,
        @NotNull(message = "DiscountValue khong duoc de trong")
        BigDecimal discountValue,
        BigDecimal minOrderValue,
        Integer usageLimit,
        Integer usedCount,
        @NotNull(message = "ExpiresAt khong duoc de trong")
        Instant expiresAt
) {}
