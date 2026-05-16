package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CartRequest;
import org.akira.auratech.dto.CartResponse;
import org.akira.auratech.model.Cart;
import org.akira.auratech.model.User;
import org.akira.auratech.repository.CartRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.CartService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository repo;
    private final UserRepository userRepository;

    @Override
    public List<CartResponse> getAllCarts() {
        return repo.findAll().stream()
                .map(CartResponse::fromEntity)
                .toList();
    }

    @Override
    public CartResponse getCartById(int id) {
        return CartResponse.fromEntity(repo.findById(id).orElse(null));
    }

    @Override
    public CartResponse getCartByUserId(int userId) {
        return CartResponse.fromEntity(repo.findByUserId(userId));
    }

    @Override
    public CartResponse createCart(CartRequest request) {
        User user = userRepository.findById(request.getUserId()).orElse(null);
        if (user == null) {
            return null;
        }
        Cart cart = Cart.builder()
                .user(user)
                .build();
        return CartResponse.fromEntity(repo.save(cart));
    }

    @Override
    public CartResponse updateCart(int id, CartRequest request) {
        Cart cart = repo.findById(id).orElse(null);
        if (cart == null) {
            return null;
        }
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            if (user == null) {
                return null;
            }
            cart.setUser(user);
        }
        return CartResponse.fromEntity(repo.save(cart));
    }

    @Override
    public void deleteCartById(int id) {
        repo.deleteById(id);
    }
}
