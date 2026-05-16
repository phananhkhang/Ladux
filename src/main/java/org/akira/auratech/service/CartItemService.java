package org.akira.auratech.service;

import org.akira.auratech.dto.CartItemRequest;
import org.akira.auratech.dto.CartItemResponse;

import java.util.List;

public interface CartItemService {
    List<CartItemResponse> getAllCartItems();

    CartItemResponse getCartItemById(int id);

    List<CartItemResponse> getCartItemsByCartId(int cartId);

    List<CartItemResponse> getCartItemsByProductId(int productId);

    CartItemResponse createCartItem(CartItemRequest request);

    CartItemResponse updateCartItem(int id, CartItemRequest request);

    void deleteCartItemById(int id);
}
