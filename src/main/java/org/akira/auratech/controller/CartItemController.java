package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.CartItemRequest;
import org.akira.auratech.dto.CartItemResponse;
import org.akira.auratech.service.CartItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cart-items")
@RequiredArgsConstructor
public class CartItemController {
    private final CartItemService service;

    @GetMapping
    public List<CartItemResponse> getAllCartItems() {
        return service.getAllCartItems();
    }

    @GetMapping("/{id}")
    public CartItemResponse getCartItemById(@PathVariable int id) {
        return service.getCartItemById(id);
    }

    @GetMapping("/cart/{cartId}")
    public List<CartItemResponse> getCartItemsByCartId(@PathVariable int cartId) {
        return service.getCartItemsByCartId(cartId);
    }

    @GetMapping("/product/{productId}")
    public List<CartItemResponse> getCartItemsByProductId(@PathVariable int productId) {
        return service.getCartItemsByProductId(productId);
    }

    @PostMapping
    public ResponseEntity<CartItemResponse> createCartItem(@Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(service.createCartItem(request));
    }

    @PutMapping("/{id}")
    public CartItemResponse updateCartItem(@PathVariable int id, @RequestBody CartItemRequest request) {
        return service.updateCartItem(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteCartItemById(@PathVariable int id) {
        service.deleteCartItemById(id);
    }
}
