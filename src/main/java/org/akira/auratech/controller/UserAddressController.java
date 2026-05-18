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

    @GetMapping("/{id}")
    public ResponseEntity<UserAddressResponse> getUserAddressById(@PathVariable int id) {
        return ResponseEntity.ok(service.getUserAddressById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAddressResponse>> getUserAddressesByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(service.getUserAddressesByUserId(userId));
    }

    @GetMapping("/user/{userId}/default")
    public ResponseEntity<List<UserAddressResponse>> getDefaultUserAddressesByUserId(@PathVariable int userId) {
        return ResponseEntity.ok(service.getDefaultUserAddressesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<UserAddressResponse> createUserAddress(@Valid @RequestBody UserAddressRequest request) {
        return new ResponseEntity<>(service.createUserAddress(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserAddressResponse> updateUserAddress(@PathVariable int id, @Valid @RequestBody UserAddressRequest request) {
        return ResponseEntity.ok(service.updateUserAddress(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserAddressById(@PathVariable int id) {
        service.deleteUserAddressById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
