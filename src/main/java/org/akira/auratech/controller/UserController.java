package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.UserRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.akira.auratech.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable int id) {
        return ResponseEntity.ok(service.getUserById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(service.getUserByEmail(email));
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        return ResponseEntity.ok(service.getActiveUsers());
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        return new ResponseEntity<>(service.createUser(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable int id, @Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(service.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable int id) {
        service.deleteUserById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
