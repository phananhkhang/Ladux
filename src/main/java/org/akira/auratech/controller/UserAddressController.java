package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.UserAddressRequest;
import org.akira.auratech.dto.UserAddressResponse;
import org.akira.auratech.service.UserAddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-addresses")
@RequiredArgsConstructor
public class UserAddressController {
    private final UserAddressService service;

    @GetMapping
    public List<UserAddressResponse> getAllUserAddresses() {
        return service.getAllUserAddresses();
    }

    @GetMapping("/{id}")
    public UserAddressResponse getUserAddressById(@PathVariable int id) {
        return service.getUserAddressById(id);
    }

    @GetMapping("/user/{userId}")
    public List<UserAddressResponse> getUserAddressesByUserId(@PathVariable int userId) {
        return service.getUserAddressesByUserId(userId);
    }

    @GetMapping("/user/{userId}/default")
    public List<UserAddressResponse> getDefaultUserAddressesByUserId(@PathVariable int userId) {
        return service.getDefaultUserAddressesByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<UserAddressResponse> createUserAddress(@Valid @RequestBody UserAddressRequest request) {
        return ResponseEntity.ok(service.createUserAddress(request));
    }

    @PutMapping("/{id}")
    public UserAddressResponse updateUserAddress(@PathVariable int id, @RequestBody UserAddressRequest request) {
        return service.updateUserAddress(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteUserAddressById(@PathVariable int id) {
        service.deleteUserAddressById(id);
    }
}
