package org.akira.ladux.dto.request;

import java.math.BigDecimal;

import org.akira.ladux.model.enums.CustomerLevel;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Cap nhat ho so khach hang (CRM). Cac truong null se duoc bo qua (semantics PATCH).
 */
public record CustomerUpdateRequest(
        @Size(max = 150, message = "Ho ten khong duoc vuot qua 150 ky tu")
        String fullName,

        @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "So dien thoai Viet Nam khong hop le")
        String phone,

        @Size(max = 255, message = "Avatar khong duoc vuot qua 255 ky tu")
        String avatarUrl,

        CustomerLevel level,

        @PositiveOrZero(message = "Diem thuong khong duoc am")
        Long loyaltyPoints,

        @PositiveOrZero(message = "Tong chi tieu khong duoc am")
        BigDecimal totalSpent
) {}
