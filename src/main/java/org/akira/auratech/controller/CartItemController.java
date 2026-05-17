package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CartItemRequest;
import org.akira.auratech.dto.CartItemResponse;
import org.akira.auratech.service.CartItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart-items")
@RequiredArgsConstructor
public class CartItemController {
    private final CartItemService service;

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getAllCartItems() {
        return ResponseEntity.ok(service.getAllCartItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartItemResponse> getCartItemById(@PathVariable int id) {
        return ResponseEntity.ok(service.getCartItemById(id));
    }

    @GetMapping("/cart/{cartId}")
    public ResponseEntity<List<CartItemResponse>> getCartItemsByCartId(@PathVariable int cartId) {
        return ResponseEntity.ok(service.getCartItemsByCartId(cartId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<CartItemResponse>> getCartItemsByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(service.getCartItemsByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<CartItemResponse> createCartItem(@Valid @RequestBody CartItemRequest request) {
        return new ResponseEntity<>(service.createCartItem(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartItemResponse> updateCartItem(@PathVariable int id, @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(service.updateCartItem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartItemById(@PathVariable int id) {
        service.deleteCartItemById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
