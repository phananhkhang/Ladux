package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CartRequest;
import org.akira.auratech.dto.CartResponse;
import org.akira.auratech.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/carts")
@RequiredArgsConstructor
public class CartController {
    private final CartService service;

    @GetMapping
    public List<CartResponse> getAllCarts() {
        return service.getAllCarts();
    }

    @GetMapping("/{id}")
    public CartResponse getCartById(@PathVariable int id) {
        return service.getCartById(id);
    }

    @GetMapping("/user/{userId}")
    public CartResponse getCartByUserId(@PathVariable int userId) {
        return service.getCartByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<CartResponse> createCart(@Valid @RequestBody CartRequest request) {
        return ResponseEntity.ok(service.createCart(request));
    }

    @PutMapping("/{id}")
    public CartResponse updateCart(@PathVariable int id, @RequestBody CartRequest request) {
        return service.updateCart(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteCartById(@PathVariable int id) {
        service.deleteCartById(id);
    }
}