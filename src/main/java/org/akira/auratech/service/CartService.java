package org.akira.auratech.service;

import org.akira.auratech.dto.request.CartItemRequest;
import org.akira.auratech.dto.response.CartResponse;

import java.util.List;

public interface CartService {
    CartResponse getCartByUserId(int userId);

    void addItemToCart(int userId, int productId, int quantity);

    void updateQuantity(int userId, int productId, int quantity);

    void removeItemFromCart(int userId, int productId);

    void clearCart(int userId);
}
