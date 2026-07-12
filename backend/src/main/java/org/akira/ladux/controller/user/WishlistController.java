package org.akira.ladux.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.request.WishlistRequest;
import org.akira.ladux.dto.response.WishlistResponse;
import org.akira.ladux.model.UserPrincipal;
import org.akira.ladux.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlists")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService service;

    @PostMapping
    public ResponseEntity<Void> addItemToWishlist(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody WishlistRequest request) {
        service.addItemToWishlist(principal.getId(), request.productId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @GetMapping
    public ResponseEntity<List<WishlistResponse>> getWishlistsByUserId(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getWishlistsByUserId(principal.getId()));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeItemFromWishlist(@AuthenticationPrincipal UserPrincipal principal, @PathVariable int productId) {
        service.removeItemFromWishlist(principal.getId(), productId);
        return ResponseEntity.noContent().build();
    }
}
