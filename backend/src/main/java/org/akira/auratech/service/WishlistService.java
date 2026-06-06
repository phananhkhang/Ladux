package org.akira.auratech.service;

import org.akira.auratech.dto.response.WishlistResponse;

import java.util.List;

public interface WishlistService {
    void addItemToWishlist(int userId, int productId);

    List<WishlistResponse> getWishlistsByUserId(int userId);

    void removeItemFromWishlist(int usrerId, int productId);
}
