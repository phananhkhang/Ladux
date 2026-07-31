package org.akira.ladux.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.model.UserPrincipal;
import org.akira.ladux.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.akira.ladux.dto.user.request.UserProfileUpdateRequest;
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(service.getUserById(principal.getId()));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> uploadAvatar(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(service.uploadAvatar(principal.getId(), file));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {
        return ResponseEntity.ok(service.updateProfile(principal.getId(), request));
    }
}