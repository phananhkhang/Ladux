package org.akira.auratech.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.UserAddressRequest;
import org.akira.auratech.dto.response.UserAddressResponse;
import org.akira.auratech.model.UserPrincipal;
import org.akira.auratech.service.UserAddressService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-addresses")
@RequiredArgsConstructor
public class UserAddressController {
    private final UserAddressService service;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserAddressResponse>> getAllUserAddresses(Pageable pageable) {
        return ResponseEntity.ok(service.getAllUserAddresses(pageable));
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<UserAddressResponse> getUserAddressById(@AuthenticationPrincipal UserPrincipal principal, @PathVariable int addressId) {
        return ResponseEntity.ok(service.getUserAddressById(principal.getId(), addressId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<UserAddressResponse>> getUserAddressesByUserId(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getUserAddressesByUserId(principal.getId()));
    }

    @GetMapping("/default")
    public ResponseEntity<List<UserAddressResponse>> getDefaultUserAddressesByUserId(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getDefaultUserAddressesByUserId(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<UserAddressResponse> createUserAddress(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody UserAddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createUserAddress(principal.getId(), request));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<UserAddressResponse> updateUserAddress(@AuthenticationPrincipal UserPrincipal principal, @PathVariable int addressId, @Valid @RequestBody UserAddressRequest request) {
        return ResponseEntity.ok(service.updateUserAddress(principal.getId(), addressId, request));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteUserAddressById(@AuthenticationPrincipal UserPrincipal principal, @PathVariable int addressId) {
        service.deleteUserAddressById(principal.getId(), addressId);
        return ResponseEntity.noContent().build();
    }
}
