package org.akira.auratech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserAddressRequest(
        @NotNull(message = "UserId khong duoc de trong")
        Integer userId,
        @NotBlank(message = "ReceiverName khong duoc de trong")
        String receiverName,
        String phone,
        @NotBlank(message = "Street khong duoc de trong")
        String street,
        @NotBlank(message = "District khong duoc de trong")
        String district,
        @NotBlank(message = "City khong duoc de trong")
        String city,
        Boolean isDefault
) {}
