package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.WishlistRequest;
import org.akira.auratech.dto.WishlistResponse;
import org.akira.auratech.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlists")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService service;

    @GetMapping
    public List<WishlistResponse> getAllWishlists() {
        return service.getAllWishlists();
    }

    @GetMapping("/{id}")
    public WishlistResponse getWishlistById(@PathVariable int id) {
        return service.getWishlistById(id);
    }

    @GetMapping("/user/{userId}")
    public List<WishlistResponse> getWishlistsByUserId(@PathVariable int userId) {
        return service.getWishlistsByUserId(userId);
    }

    @GetMapping("/product/{productId}")
    public List<WishlistResponse> getWishlistsByProductId(@PathVariable int productId) {
        return service.getWishlistsByProductId(productId);
    }

    @PostMapping
    public ResponseEntity<WishlistResponse> createWishlist(@Valid @RequestBody WishlistRequest request) {
        return ResponseEntity.ok(service.createWishlist(request));
    }

    @PutMapping("/{id}")
    public WishlistResponse updateWishlist(@PathVariable int id, @RequestBody WishlistRequest request) {
        return service.updateWishlist(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteWishlistById(@PathVariable int id) {
        service.deleteWishlistById(id);
    }
}
