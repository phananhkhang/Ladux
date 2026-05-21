package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.UserAddressRequest;
import org.akira.auratech.dto.response.UserAddressResponse;
import org.akira.auratech.service.UserAddressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-addresses")
@RequiredArgsConstructor
public class UserAddressController {
    private final UserAddressService service;

    @GetMapping
    public ResponseEntity<List<UserAddressResponse>> getAllUserAddresses() {
        return ResponseEntity.ok(service.getAllUserAddresses());
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<UserAddressResponse> getUserAddressById(@RequestHeader("X-User-Id") int userId, @PathVariable int addressId) {
        return ResponseEntity.ok(service.getUserAddressById(userId, addressId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<UserAddressResponse>> getUserAddressesByUserId(@RequestHeader("X-User-Id") int userId) {
        return ResponseEntity.ok(service.getUserAddressesByUserId(userId));
    }

    @GetMapping("/default")
    public ResponseEntity<List<UserAddressResponse>> getDefaultUserAddressesByUserId(@RequestHeader("X-User-Id") int userId) {
        return ResponseEntity.ok(service.getDefaultUserAddressesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<UserAddressResponse> createUserAddress(@RequestHeader("X-User-Id") int userId, @Valid @RequestBody UserAddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createUserAddress(userId, request));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<UserAddressResponse> updateUserAddress(@RequestHeader("X-User-Id") int userId, @PathVariable int addressId, @Valid @RequestBody UserAddressRequest request) {
        return ResponseEntity.ok(service.updateUserAddress(userId, addressId, request));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteUserAddressById(@RequestHeader("X-User-Id") int userId, @PathVariable int addressId) {
        service.deleteUserAddressById(userId, addressId);
        return ResponseEntity.noContent().build();
    }
}
