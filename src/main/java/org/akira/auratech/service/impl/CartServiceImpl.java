package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.Cart;
import org.akira.auratech.repository.CartRepository;
import org.akira.auratech.service.CartService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository repo;

    @Override
    public List<Cart> getAllCarts() {
        return repo.findAll();
    }

    @Override
    public Cart getCartById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public Cart getCartByUserId(int userId) {
        return repo.findByUserId(userId);
    }

    @Override
    public Cart createCart(Cart cart) {
        return repo.save(cart);
    }

    @Override
    public Cart updateCart(Cart cart) {
        return repo.save(cart);
    }

    @Override
    public void deleteCartById(int id) {
        repo.deleteById(id);
    }
}

