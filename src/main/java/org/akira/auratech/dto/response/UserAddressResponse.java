package org.akira.auratech.dto.response;

import org.akira.auratech.model.UserAddress;

public record UserAddressResponse(
        Integer userId,
        String receiverName,
        String phone,
        String street,
        String district,
        String city,
        boolean isDefault
) {
    public static UserAddressResponse fromEntity(UserAddress address) {
        if (address == null) {
            return null;
        }
        return new UserAddressResponse(
                address.getId(),
                address.getReceiverName(),
                address.getPhone(),
                address.getStreet(),
                address.getDistrict(),
                address.getCity(),
                address.isDefault()
        );
    }
}
