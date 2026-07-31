package org.akira.ladux.dto.response.user;

import org.akira.ladux.model.UserAddress;

import java.io.Serializable;

public record UserAddressResponse(
        Integer id,
        Integer userId,
        String receiverName,
        String phone,
        String street,
        String ward,
        String district,
        String city,
        boolean isDefault
) implements Serializable {
    public static UserAddressResponse fromEntity(UserAddress address) {
        if (address == null) {
            return null;
        }
        return new UserAddressResponse(
                address.getId(),
                address.getUser() == null ? null : address.getUser().getId(),
                address.getReceiverName(),
                address.getPhone(),
                address.getStreet(),
                address.getWard(),
                address.getDistrict(),
                address.getCity(),
                address.isDefault()
        );
    }
}
