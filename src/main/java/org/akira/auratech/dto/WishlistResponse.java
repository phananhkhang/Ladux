package org.akira.auratech.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.akira.auratech.model.Wishlist;

import java.time.Instant;

@Getter
@Setter
@Builder
public class WishlistResponse {
    private Integer id;
    private Integer userId;
    private Integer productId;
    private Instant addedAt;

    public static WishlistResponse fromEntity(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }
        return WishlistResponse.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUser() == null ? null : wishlist.getUser().getId())
                .productId(wishlist.getProduct() == null ? null : wishlist.getProduct().getId())
                .addedAt(wishlist.getAddedAt())
                .build();
    }
}

