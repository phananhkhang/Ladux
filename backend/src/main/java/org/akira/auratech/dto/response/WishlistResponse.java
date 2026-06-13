package org.akira.auratech.dto.response;

import org.akira.auratech.model.Wishlist;
import java.io.Serializable;
import java.time.Instant;

public record WishlistResponse(
        Integer id,
        ProductResponse product
) implements Serializable {
    public static WishlistResponse fromEntity(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }
        return new WishlistResponse(
                wishlist.getId(),
                wishlist.getProduct() == null ? null : ProductResponse.fromEntity(wishlist.getProduct())
        );
    }
}
