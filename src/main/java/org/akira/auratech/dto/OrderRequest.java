package org.akira.auratech.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.enums.OrderStatus;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderRequest {
    @NotNull(message = "UserId khong duoc de trong")
    private Integer userId;

    private Integer couponId;

    @NotNull(message = "SubTotal khong duoc de trong")
    private BigDecimal subTotal;

    private BigDecimal discountAmount;

    @NotNull(message = "FinalAmount khong duoc de trong")
    private BigDecimal finalAmount;

    private OrderStatus status;

    private String shippingAddress;

    private String trackingNumber;
}

