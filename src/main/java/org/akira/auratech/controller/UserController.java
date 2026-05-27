package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.UserRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.akira.auratech.service.JwtService;
import org.akira.auratech.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserRequest request) {
        return new ResponseEntity<>(service.savedUser(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public String login(@Valid @RequestBody UserRequest request) {
        Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        if (auth.isAuthenticated()) {
            return jwtService.generateToken(request.username());
        } else {
            return "Login failed";
        }
    }

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(service.getAllUsers(pageable));
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
    public ResponseEntity<Page<UserResponse>> getActiveUsers(Pageable pageable) {
        return ResponseEntity.ok(service.getActiveUsers(pageable));
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
