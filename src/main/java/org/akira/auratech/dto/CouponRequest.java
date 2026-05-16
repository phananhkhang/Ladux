package org.akira.auratech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class CouponRequest {
    @NotBlank(message = "Code khong duoc de trong")
    private String code;

    @NotNull(message = "DiscountType khong duoc de trong")
    private DiscountType discountType;

    @NotNull(message = "DiscountValue khong duoc de trong")
    private BigDecimal discountValue;

    private BigDecimal minOrderValue;

    private Integer usageLimit;

    private Integer usedCount;

    @NotNull(message = "ExpiresAt khong duoc de trong")
    private Instant expiresAt;
}

