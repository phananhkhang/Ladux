package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CartRequest;
import org.akira.auratech.dto.CartResponse;
import org.akira.auratech.model.Cart;
import org.akira.auratech.model.User;
import org.akira.auratech.repository.CartRepository;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.CartService;
import org.akira.auratech.exception.ResourceNotFoundException;
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
        return CartResponse.fromEntity(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart voi id = " + id)));
    }

    @Override
    public CartResponse getCartByUserId(int userId) {
        Cart cart = repo.findByUserId(userId);
        if (cart == null) {
            throw new ResourceNotFoundException("Khong tim thay cart voi userId = " + userId);
        }
        return CartResponse.fromEntity(cart);
    }

    @Override
    public CartResponse createCart(CartRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.getUserId()));
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
        Cart cart = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay cart voi id = " + id));
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay user voi id = " + request.getUserId()));
            cart.setUser(user);
        }
        return CartResponse.fromEntity(repo.save(cart));
    }

    @Override
    public void deleteCartById(int id) {
        repo.deleteById(id);
    }
}
