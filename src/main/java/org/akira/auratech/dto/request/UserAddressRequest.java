package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UserAddressRequest(
        @NotNull(message = "UserId khong duoc de trong")
        @Positive(message = "UserId phai la so duong")
        Integer userId,

        @NotBlank(message = "ReceiverName khong duoc de trong")
        @Size(max = 150, message = "ReceiverName khong duoc vuot qua 150 ky tu")
        String receiverName,

        @Pattern(regexp = "^[0-9+\\-\\s]{8,20}$", message = "Phone khong hop le")
        String phone,

        @NotBlank(message = "Street khong duoc de trong")
        @Size(max = 255, message = "Street khong duoc vuot qua 255 ky tu")
        String street,

        @NotBlank(message = "District khong duoc de trong")
        @Size(max = 120, message = "District khong duoc vuot qua 120 ky tu")
        String district,

        @NotBlank(message = "City khong duoc de trong")
        @Size(max = 120, message = "City khong duoc vuot qua 120 ky tu")
        String city,

        Boolean isDefault
) {}
