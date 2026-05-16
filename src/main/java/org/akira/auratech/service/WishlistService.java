package org.akira.auratech.service;

import org.akira.auratech.model.Wishlist;

import java.util.List;

public interface WishlistService {
    List<Wishlist> getAllWishlists();

    Wishlist getWishlistById(int id);

    List<Wishlist> getWishlistsByUserId(int userId);

    List<Wishlist> getWishlistsByProductId(int productId);

    Wishlist createWishlist(Wishlist wishlist);

    Wishlist updateWishlist(Wishlist wishlist);

    void deleteWishlistById(int id);
}
