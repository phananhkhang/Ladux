package org.akira.ladux.dto.user.response;

import org.akira.ladux.model.Wishlist;
import java.io.Serializable;
import java.time.Instant;

import org.akira.ladux.dto.catalog.response.ProductResponse;
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
