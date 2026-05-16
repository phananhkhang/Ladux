package org.akira.auratech.service;

import org.akira.auratech.model.Cart;

import java.util.List;

public interface CartService {
    List<Cart> getAllCarts();

    Cart getCartById(int id);

    Cart getCartByUserId(int userId);

    Cart createCart(Cart cart);

    Cart updateCart(Cart cart);

    void deleteCartById(int id);
}
