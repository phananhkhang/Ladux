package org.akira.ladux.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.system.response.EmailOtpSendResponse;
import org.akira.ladux.dto.system.response.OtpSendResponse;
import org.akira.ladux.dto.user.request.EmailVerifyRequest;
import org.akira.ladux.dto.user.request.PhoneVerifyRequest;
import org.akira.ladux.dto.user.request.UserUpdatePassword;
import org.akira.ladux.dto.system.response.PasswordVerificationResponse;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.service.EmailVerificationService;
import org.akira.ladux.service.PhoneVerificationService;
import org.akira.ladux.service.UserService;
import org.akira.ladux.utils.SecurityUtils;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService service;
    private final PhoneVerificationService phoneVerificationService;
    private final EmailVerificationService emailVerificationService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(service.getUserById(SecurityUtils.getCurrentUserId()));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(service.uploadAvatar(SecurityUtils.getCurrentUserId(), file));
    }

    @PostMapping("/me/password/phone/otp")
    public ResponseEntity<OtpSendResponse> sendPasswordChangePhoneOtp() {
        return ResponseEntity.ok(phoneVerificationService.sendPasswordChangeOtp());
    }

    @PostMapping("/me/password/phone/verify")
    public ResponseEntity<PasswordVerificationResponse> verifyPasswordChangePhoneOtp(
            @Valid @RequestBody PhoneVerifyRequest request
    ) {
        return ResponseEntity.ok(phoneVerificationService.verifyPasswordChangeOtp(request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody UserUpdatePassword request
    ) {
        service.changePassword(SecurityUtils.getCurrentUserId(), request);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/me/password/email/otp")
    public ResponseEntity<EmailOtpSendResponse> sendPasswordEmailOtp() {
        return ResponseEntity.ok(
                emailVerificationService
                        .sendPasswordChangeOtp()
        );
    }
    @PostMapping("/me/password/email/verify")
    public ResponseEntity<PasswordVerificationResponse> verifyPasswordEmailOtp(
            @Valid
            @RequestBody EmailVerifyRequest request
    ) {
        return ResponseEntity.ok(
                emailVerificationService
                        .verifyPasswordChangeOtp(request)
        );
    }
}
