package org.akira.ladux.service;
import org.akira.ladux.dto.order.response.CartResponse;

public interface CartService {
    CartResponse getCartByUserId(int userId);

    void addItemToCart(int userId, int productId, int quantity);

    void updateQuantity(int userId, int productId, int quantity);

    void removeItemFromCart(int userId, int productId);

    void clearCart(int userId);
}
