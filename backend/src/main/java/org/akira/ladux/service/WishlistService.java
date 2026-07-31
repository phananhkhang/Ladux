package org.akira.ladux.service;

import org.akira.ladux.dto.user.response.WishlistResponse;

import java.util.List;

public interface WishlistService {
    void addItemToWishlist(int userId, int productId);

    List<WishlistResponse> getWishlistsByUserId(int userId);

    void removeItemFromWishlist(int usrerId, int productId);
}
