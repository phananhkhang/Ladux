package org.akira.ladux.service.impl;

import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import jakarta.annotation.PostConstruct;
import org.akira.ladux.dto.internal.otp.ProviderOtpResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.service.PhoneOtpProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("twilio")
public class TwilioPhoneOtpProvider implements PhoneOtpProvider {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.verify-service-sid}")
    private String verifyServiceSid;

    @PostConstruct
    public void initialize() {
        Twilio.init(
                accountSid,
                authToken
        );
    }

    @Override
    public ProviderOtpResponse sendOtp(String phoneNumber) {
        try {
            Verification verification = Verification.creator(
                    verifyServiceSid,
                    phoneNumber,
                    "sms"
            ).create();

            return new ProviderOtpResponse(
                    verification.getSid(),
                    verification.getStatus()
            );
        } catch (Exception exception) {
            throw new BusinessRuleException(
                    "Không thể gửi mã OTP đến số điện thoại"
            );
        }
    }

    @Override
    public boolean verifyOtp(
            String providerVerificationId,
            String otp
    ) {
        try {
            VerificationCheck verificationCheck =
                    VerificationCheck.creator(
                                    verifyServiceSid
                            )
                            .setVerificationSid(
                                    providerVerificationId
                            )
                            .setCode(otp)
                            .create();

            return "approved".equalsIgnoreCase(
                    verificationCheck.getStatus()
            );
        } catch (Exception exception) {
            throw new BusinessRuleException(
                    "Không thể xác minh mã OTP"
            );
        }
    }
}
