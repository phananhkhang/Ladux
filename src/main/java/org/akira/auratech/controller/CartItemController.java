package org.akira.auratech.controller;

import org.akira.auratech.model.CartItem;
import org.akira.auratech.service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart-items")
public class CartItemController {
    @Autowired
    CartItemService service;

    @GetMapping("/all")
    public List<CartItem> getAllCartItems() {
        return service.getAllCartItems();
    }

    @GetMapping("/{id}")
    public CartItem getCartItemById(@PathVariable int id) {
        return service.getCartItemById(id);
    }

    @GetMapping("/cart/{cartId}")
    public List<CartItem> getCartItemsByCartId(@PathVariable int cartId) {
        return service.getCartItemsByCartId(cartId);
    }

    @GetMapping("/product/{productId}")
    public List<CartItem> getCartItemsByProductId(@PathVariable int productId) {
        return service.getCartItemsByProductId(productId);
    }

    @PostMapping
    public CartItem createCartItem(@RequestBody CartItem cartItem) {
        return service.createCartItem(cartItem);
    }

    @PutMapping
    public CartItem updateCartItem(@RequestBody CartItem cartItem) {
        return service.updateCartItem(cartItem);
    }

    @DeleteMapping("/{id}")
    public void deleteCartItemById(@PathVariable int id) {
        service.deleteCartItemById(id);
    }
}

