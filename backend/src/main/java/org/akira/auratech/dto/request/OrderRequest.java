package org.akira.auratech.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.akira.auratech.model.enums.PaymentProvider;

import java.util.List;

public record OrderRequest(
        String couponCode,

        @NotNull(message = "PaymentProvider khong duoc de trong")
        PaymentProvider paymentProvider,

        @NotBlank(message = "ShippingAddress khong duoc de trong")
        @Size(max = 1000, message = "ShippingAddress khong duoc vuot qua 1000 ky tu")
        String shippingAddress,

        @NotEmpty(message = "Danh sach san pham khong duoc de trong")
        List<@Valid OrderLineRequest> items
) {}
