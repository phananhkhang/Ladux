package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record OrderItemRequest(
        @NotNull(message = "OrderId khong duoc de trong")
        Integer orderId,
        @NotNull(message = "ProductId khong duoc de trong")
        Integer productId,
        Integer quantity,
        @NotNull(message = "PriceAtPurchase khong duoc de trong")
        BigDecimal priceAtPurchase
) {}
