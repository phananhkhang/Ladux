package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.config.DevOtpProperties;
import org.akira.ladux.dto.internal.otp.ProviderOtpResponse;
import org.akira.ladux.service.PhoneOtpProvider;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Primary
@RequiredArgsConstructor
public class DevPhoneOtpProvider implements PhoneOtpProvider {

    private final DevOtpProperties properties;

    @Override
    public ProviderOtpResponse sendOtp(String phoneNumber) {
        String providerVerificationId =
                "FIXED-" + UUID.randomUUID();

        return new ProviderOtpResponse(
                providerVerificationId,
                "SENT"
        );
    }

    @Override
    public boolean verifyOtp(
            String providerVerificationId,
            String otp
    ) {
        return providerVerificationId != null
                && providerVerificationId.startsWith("FIXED-")
                && properties.getFixedCode().equals(otp);
    }
}
