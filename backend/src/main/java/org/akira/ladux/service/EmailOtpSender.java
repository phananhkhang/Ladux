package org.akira.ladux.service;

import org.akira.ladux.model.enums.EmailVerificationPurpose;

public interface EmailOtpSender {
    void sendOtp(
            String recipient,
            String otp,
            EmailVerificationPurpose purpose
    );
}
