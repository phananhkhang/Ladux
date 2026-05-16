package org.akira.auratech.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserAddressRequest {
    @NotNull(message = "UserId khong duoc de trong")
    private Integer userId;

    @NotBlank(message = "ReceiverName khong duoc de trong")
    private String receiverName;

    private String phone;

    @NotBlank(message = "Street khong duoc de trong")
    private String street;

    @NotBlank(message = "District khong duoc de trong")
    private String district;

    @NotBlank(message = "City khong duoc de trong")
    private String city;

    private Boolean isDefault;
}

