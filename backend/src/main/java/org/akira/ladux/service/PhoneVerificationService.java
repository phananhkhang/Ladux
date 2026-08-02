package org.akira.ladux.service;

import org.akira.ladux.dto.system.response.OtpSendResponse;
import org.akira.ladux.dto.user.request.PhoneRegisterRequest;
import org.akira.ladux.dto.user.request.PhoneVerifyRequest;
import org.akira.ladux.dto.user.response.CustomerResponse;
import org.akira.ladux.dto.system.response.PasswordVerificationResponse;

public interface PhoneVerificationService {

    OtpSendResponse sendPhoneOtp(
            PhoneRegisterRequest request
    );

    CustomerResponse verifyPhoneOtp(
            PhoneVerifyRequest request
    );

    OtpSendResponse sendPasswordChangeOtp();

    PasswordVerificationResponse verifyPasswordChangeOtp(
            PhoneVerifyRequest request
    );

    void consumePasswordChangeVerification(
            Integer customerId,
            String verificationId
    );
}
