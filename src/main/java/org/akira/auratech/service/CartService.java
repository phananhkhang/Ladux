package org.akira.auratech.service;

import org.akira.auratech.dto.request.CartRequest;
import org.akira.auratech.dto.response.CartResponse;

import java.util.List;

public interface CartService {
    List<CartResponse> getAllCarts();

    CartResponse getCartById(int id);

    CartResponse getCartByUserId(int userId);

    CartResponse createCart(CartRequest request);

    CartResponse updateCart(int id, CartRequest request);

    void deleteCartById(int id);
}
