package org.akira.auratech.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.auratech.model.CartItem;
import org.akira.auratech.repository.CartItemRepository;
import org.akira.auratech.service.CartItemService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartItemServiceImpl implements CartItemService {
    private final CartItemRepository repo;

    @Override
    public List<CartItem> getAllCartItems() {
        return repo.findAll();
    }

    @Override
    public CartItem getCartItemById(int id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public List<CartItem> getCartItemsByCartId(int cartId) {
        return repo.findByCartId(cartId);
    }

    @Override
    public List<CartItem> getCartItemsByProductId(int productId) {
        return repo.findByProductId(productId);
    }

    @Override
    public CartItem createCartItem(CartItem cartItem) {
        return repo.save(cartItem);
    }

    @Override
    public CartItem updateCartItem(CartItem cartItem) {
        return repo.save(cartItem);
    }

    @Override
    public void deleteCartItemById(int id) {
        repo.deleteById(id);
    }
}

