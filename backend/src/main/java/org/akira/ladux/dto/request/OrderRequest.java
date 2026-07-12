package org.akira.ladux.dto.request;

import org.akira.ladux.model.enums.PaymentProvider;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderRequest(
        String couponCode,

        @NotNull(message = "PaymentProvider khong duoc de trong")
        PaymentProvider paymentProvider,

        @NotBlank(message = "ShippingAddress khong duoc de trong")
        @Size(max = 1000, message = "ShippingAddress khong duoc vuot qua 1000 ky tu")
        String shippingAddress
) {}
