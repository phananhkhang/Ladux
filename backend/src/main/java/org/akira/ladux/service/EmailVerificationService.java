package org.akira.ladux.service;

import org.akira.ladux.dto.system.response.EmailOtpSendResponse;
import org.akira.ladux.dto.system.response.PasswordVerificationResponse;
import org.akira.ladux.dto.user.request.EmailRegisterRequest;
import org.akira.ladux.dto.user.request.EmailVerifyRequest;
import org.akira.ladux.dto.user.response.UserResponse;

public interface EmailVerificationService {

    EmailOtpSendResponse sendEmailUpdateOtp(
            EmailRegisterRequest request
    );

    UserResponse verifyEmailUpdateOtp(
            EmailVerifyRequest request
    );

    EmailOtpSendResponse sendPasswordChangeOtp();

    PasswordVerificationResponse verifyPasswordChangeOtp(
            EmailVerifyRequest request
    );

    void consumePasswordChangeVerification(
            Integer customerId,
            String verificationId
    );
}
