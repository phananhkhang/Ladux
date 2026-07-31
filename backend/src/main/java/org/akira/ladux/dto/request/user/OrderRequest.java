package org.akira.ladux.dto.request.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.akira.ladux.model.enums.PaymentProvider;

public record OrderRequest(
        String couponCode,

        @NotNull(message = "PaymentProvider khong duoc de trong")
        PaymentProvider paymentProvider,

        @NotNull(message = "ShippingAddress khong duoc de trong")
        @Valid
        ShippingAddressRequest shippingAddress
) {}
