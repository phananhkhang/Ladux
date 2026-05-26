package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CartItemRequest;
import org.akira.auratech.dto.response.CartResponse;
import org.akira.auratech.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService service;

    @GetMapping
    public ResponseEntity<CartResponse> getCartByUserId(@RequestHeader("X-User-Id") int userId) {
        CartResponse response = service.getCartByUserId(userId);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/items")
    public ResponseEntity<Void> addItemToCart(@RequestHeader("X-User-Id") int userId, @RequestBody @Valid CartItemRequest request) {
        service.addItemToCart(userId, request.productId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @PutMapping("/items/{productId}")
    public ResponseEntity<Void> updateQuantity(@RequestHeader("X-User-Id") int userId, @PathVariable int productId, @RequestBody int quantity) {
        service.updateQuantity(userId, productId, quantity);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItemFromCart(@RequestHeader("X-User-Id") int userId, @PathVariable int productId) {
        service.removeItemFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping
    public ResponseEntity<Void> clearCart(@RequestHeader("X-User-Id") int userId) {
        service.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}
