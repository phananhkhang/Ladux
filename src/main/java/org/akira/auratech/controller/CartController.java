package org.akira.auratech.controller;

import org.akira.auratech.model.Cart;
import org.akira.auratech.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carts")
public class CartController {
    @Autowired
    CartService service;

    @GetMapping("/all")
    public List<Cart> getAllCarts() {
        return service.getAllCarts();
    }

    @GetMapping("/{id}")
    public Cart getCartById(@PathVariable int id) {
        return service.getCartById(id);
    }

    @GetMapping("/user/{userId}")
    public Cart getCartByUserId(@PathVariable int userId) {
        return service.getCartByUserId(userId);
    }

    @PostMapping
    public Cart createCart(@RequestBody Cart cart) {
        return service.createCart(cart);
    }

    @PutMapping
    public Cart updateCart(@RequestBody Cart cart) {
        return service.updateCart(cart);
    }

    @DeleteMapping("/{id}")
    public void deleteCartById(@PathVariable int id) {
        service.deleteCartById(id);
    }
}