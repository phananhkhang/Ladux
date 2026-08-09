package org.akira.ladux.service.impl;

import org.akira.ladux.dto.internal.otp.ProviderOtpResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.service.PhoneOtpProvider;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Phone OTP is intentionally disabled in production until an SMS provider is configured.
 * Keeping an explicit provider avoids accidentally falling back to the dev fixed OTP.
 */
@Service
@Profile("prod")
public class DisabledPhoneOtpProvider implements PhoneOtpProvider {

    private static final String DISABLED_MESSAGE =
            "Xác thực số điện thoại hiện chưa được bật trên production";

    @Override
    public ProviderOtpResponse sendOtp(String phoneNumber) {
        throw new BusinessRuleException(DISABLED_MESSAGE);
    }

    @Override
    public boolean verifyOtp(String providerVerificationId, String otp) {
        throw new BusinessRuleException(DISABLED_MESSAGE);
    }
}
