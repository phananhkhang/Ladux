package org.akira.auratech.service;

import org.akira.auratech.dto.request.WishlistRequest;
import org.akira.auratech.dto.response.WishlistResponse;

import java.util.List;

public interface WishlistService {
    List<WishlistResponse> getAllWishlists();

    WishlistResponse getWishlistById(int id);

    List<WishlistResponse> getWishlistsByUserId(int userId);

    List<WishlistResponse> getWishlistsByProductId(int productId);

    WishlistResponse createWishlist(WishlistRequest request);

    WishlistResponse updateWishlist(int id, WishlistRequest request);

    void deleteWishlistById(int id);
}
