package org.akira.auratech.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemRequest {
    @NotNull(message = "OrderId khong duoc de trong")
    private Integer orderId;

    @NotNull(message = "ProductId khong duoc de trong")
    private Integer productId;

    private Integer quantity;

    @NotNull(message = "PriceAtPurchase khong duoc de trong")
    private BigDecimal priceAtPurchase;
}

