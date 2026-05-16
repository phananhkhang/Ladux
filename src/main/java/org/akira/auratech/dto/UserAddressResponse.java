package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.UserAddress;

@Getter
@Setter
@Builder
public class UserAddressResponse {
    private Integer id;
    private Integer userId;
    private String receiverName;
    private String phone;
    private String street;
    private String district;
    private String city;
    private boolean isDefault;

    public static UserAddressResponse fromEntity(UserAddress address) {
        if (address == null) {
            return null;
        }
        return UserAddressResponse.builder()
                .id(address.getId())
                .userId(address.getUser() == null ? null : address.getUser().getId())
                .receiverName(address.getReceiverName())
                .phone(address.getPhone())
                .street(address.getStreet())
                .district(address.getDistrict())
                .city(address.getCity())
                .isDefault(address.isDefault())
                .build();
    }
}

