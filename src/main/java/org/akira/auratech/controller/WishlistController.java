package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.WishlistRequest;
import org.akira.auratech.dto.response.WishlistResponse;
import org.akira.auratech.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlists")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService service;

    @PostMapping
    public ResponseEntity<Void> addItemToWishlist(@RequestHeader("X-User-Id") int userId, @Valid @RequestBody WishlistRequest request) {
        service.addItemToWishlist(userId, request.productId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getWishlistsByUserId(@RequestHeader("X-User-Id") int userId) {
        return ResponseEntity.ok(service.getWishlistsByUserId(userId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeItemFromWishlist(@RequestHeader("X-User-Id") int userId, @PathVariable int productId) {
        service.removeItemFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }
}
