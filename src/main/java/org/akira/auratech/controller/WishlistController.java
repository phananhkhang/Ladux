package org.akira.auratech.controller;

import org.akira.auratech.model.Wishlist;
import org.akira.auratech.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wishlists")
public class WishlistController {
    @Autowired
    WishlistService service;

    @GetMapping("/all")
    public List<Wishlist> getAllWishlists() {
        return service.getAllWishlists();
    }

    @GetMapping("/{id}")
    public Wishlist getWishlistById(@PathVariable int id) {
        return service.getWishlistById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Wishlist> getWishlistsByUserId(@PathVariable int userId) {
        return service.getWishlistsByUserId(userId);
    }

    @GetMapping("/product/{productId}")
    public List<Wishlist> getWishlistsByProductId(@PathVariable int productId) {
        return service.getWishlistsByProductId(productId);
    }

    @PostMapping
    public Wishlist createWishlist(@RequestBody Wishlist wishlist) {
        return service.createWishlist(wishlist);
    }

    @PutMapping
    public Wishlist updateWishlist(@RequestBody Wishlist wishlist) {
        return service.updateWishlist(wishlist);
    }

    @DeleteMapping("/{id}")
    public void deleteWishlistById(@PathVariable int id) {
        service.deleteWishlistById(id);
    }
}

