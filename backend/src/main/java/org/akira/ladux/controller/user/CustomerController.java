package org.akira.ladux.controller.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.system.response.OtpSendResponse;
import org.akira.ladux.dto.user.request.PhoneRegisterRequest;
import org.akira.ladux.dto.user.request.PhoneVerifyRequest;
import org.akira.ladux.dto.user.response.CustomerResponse;
import org.akira.ladux.service.PhoneVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/customers/me")
public class CustomerController {

    private final PhoneVerificationService phoneVerificationService;

    /**
     * Gửi OTP đến số điện thoại người dùng nhập.
     * Bước này chưa cập nhật Customer.phone.
     */
    @PostMapping("/phone/otp")
    public ResponseEntity<OtpSendResponse> sendPhoneOtp(
            @Valid @RequestBody PhoneRegisterRequest request
    ) {
        return ResponseEntity.ok(
                phoneVerificationService.sendPhoneOtp(request)
        );
    }

    /**
     * Kiểm tra OTP.
     * Nếu OTP đúng thì cập nhật Customer.phone.
     */
    @PostMapping("/phone/verify")
    public ResponseEntity<CustomerResponse> verifyPhoneOtp(
            @Valid @RequestBody PhoneVerifyRequest request
    ) {
        return ResponseEntity.ok(
                phoneVerificationService.verifyPhoneOtp(request)
        );
    }
}