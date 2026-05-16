package org.akira.auratech.service;

import org.akira.auratech.model.CartItem;

import java.util.List;

public interface CartItemService {
    List<CartItem> getAllCartItems();

    CartItem getCartItemById(int id);

    List<CartItem> getCartItemsByCartId(int cartId);

    List<CartItem> getCartItemsByProductId(int productId);

    CartItem createCartItem(CartItem cartItem);

    CartItem updateCartItem(CartItem cartItem);

    void deleteCartItemById(int id);
}
