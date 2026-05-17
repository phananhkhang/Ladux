package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.WishlistRequest;
import org.akira.auratech.dto.WishlistResponse;
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

    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getAllWishlists() {
        return ResponseEntity.ok(service.getAllWishlists());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WishlistResponse> getWishlistById(@PathVariable int id) {
        return ResponseEntity.ok(service.getWishlistById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WishlistResponse>> getWishlistsByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(service.getWishlistsByUserId(userId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<WishlistResponse>> getWishlistsByProductId(@PathVariable int productId) {
        return ResponseEntity.ok(service.getWishlistsByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<WishlistResponse> createWishlist(@Valid @RequestBody WishlistRequest request) {
        return new ResponseEntity<>(service.createWishlist(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WishlistResponse> updateWishlist(@PathVariable int id, @Valid @RequestBody WishlistRequest request) {
        return ResponseEntity.ok(service.updateWishlist(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWishlistById(@PathVariable int id) {
        service.deleteWishlistById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
