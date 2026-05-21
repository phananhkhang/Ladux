package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CartItemRequest;
import org.akira.auratech.dto.response.CartResponse;
import org.akira.auratech.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService service;

    @GetMapping
    public ResponseEntity<CartResponse> getCartByUserId() {
        CartResponse response = service.getCartByUserId(1);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/items")
    public ResponseEntity<Void> addItemToCart(@RequestBody @Valid CartItemRequest request) {
        int userId = 1;
        service.addItemToCart(userId, request.productId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @PutMapping("/items/{productId}")
    public ResponseEntity<Void> updateQuantity(@PathVariable int productId, @RequestBody int quantity) {
        int userId = 1;
        service.updateQuantity(userId, productId, quantity);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItemFromCart(@PathVariable int productId) {
        int userId = 1;
        service.removeItemFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        int userId = 1;
        service.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}