package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.CartRequest;
import org.akira.auratech.dto.response.CartResponse;
import org.akira.auratech.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/carts")
@RequiredArgsConstructor
public class CartController {
    private final CartService service;

    @GetMapping
    public ResponseEntity<List<CartResponse>> getAllCarts() {
        return ResponseEntity.ok(service.getAllCarts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CartResponse> getCartById(@PathVariable int id) {
        return ResponseEntity.ok(service.getCartById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<CartResponse> getCartByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(service.getCartByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<CartResponse> createCart(@Valid @RequestBody CartRequest request) {
        return new ResponseEntity<>(service.createCart(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CartResponse> updateCart(@PathVariable int id, @Valid @RequestBody CartRequest request) {
        return ResponseEntity.ok(service.updateCart(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCartById(@PathVariable int id) {
        service.deleteCartById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}