package org.akira.auratech.dto.response;

import org.akira.auratech.model.Wishlist;
import java.time.Instant;

public record WishlistResponse(
        Integer id,
        Integer userId,
        Integer productId,
        Instant addedAt
) {
    public static WishlistResponse fromEntity(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }
        return new WishlistResponse(
                wishlist.getId(),
                wishlist.getUser() == null ? null : wishlist.getUser().getId(),
                wishlist.getProduct() == null ? null : wishlist.getProduct().getId(),
                wishlist.getAddedAt()
        );
    }
}
