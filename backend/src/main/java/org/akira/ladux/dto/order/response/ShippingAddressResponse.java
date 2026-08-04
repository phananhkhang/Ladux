package org.akira.ladux.dto.order.response;

import org.akira.ladux.model.ShippingAddress;

import java.io.Serializable;

/**
 * API representation of an order's immutable shipping-address snapshot.
 * Keeping the JPA embeddable out of the response also makes Redis cache
 * serialization independent from the persistence model.
 */
public record ShippingAddressResponse(
        String receiverName,
        String phone,
        String street,
        String ward,
        String district,
        String city
) implements Serializable {
    public static ShippingAddressResponse fromEntity(ShippingAddress address) {
        if (address == null) {
            return null;
        }
        return new ShippingAddressResponse(
                address.getReceiverName(),
                address.getPhone(),
                address.getStreet(),
                address.getWard(),
                address.getDistrict(),
                address.getCity()
        );
    }
}
