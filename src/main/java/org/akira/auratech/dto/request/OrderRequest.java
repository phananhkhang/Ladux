package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;
import org.akira.auratech.model.enums.OrderStatus;
import java.math.BigDecimal;

public record OrderRequest(
        @NotNull(message = "UserId khong duoc de trong")
        Integer userId,
        Integer couponId,
        @NotNull(message = "SubTotal khong duoc de trong")
        BigDecimal subTotal,
        BigDecimal discountAmount,
        @NotNull(message = "FinalAmount khong duoc de trong")
        BigDecimal finalAmount,
        OrderStatus status,
        String shippingAddress,
        String trackingNumber
) {}
