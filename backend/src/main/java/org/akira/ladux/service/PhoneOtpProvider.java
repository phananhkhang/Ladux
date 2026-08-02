package org.akira.ladux.service;

import org.akira.ladux.dto.internal.otp.ProviderOtpResponse;

public interface PhoneOtpProvider {

    ProviderOtpResponse sendOtp(String phoneNumber);

    boolean verifyOtp(
            String providerVerificationId,
            String otp
    );
}