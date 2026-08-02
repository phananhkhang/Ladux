package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.repository.EmailVerificationRepository;
import org.akira.ladux.repository.PhoneVerificationRepository;
import org.akira.ladux.service.EmailVerificationService;
import org.akira.ladux.service.PasswordVerificationService;
import org.akira.ladux.service.PhoneVerificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PasswordVerificationServiceImpl
        implements PasswordVerificationService {

    private final PhoneVerificationRepository
            phoneVerificationRepository;

    private final EmailVerificationRepository
            emailVerificationRepository;

    private final PhoneVerificationService
            phoneVerificationService;

    private final EmailVerificationService
            emailVerificationService;

    @Override
    @Transactional
    public void consume(
            Integer customerId,
            String verificationId
    ) {
        boolean phoneVerificationExists =
                phoneVerificationRepository
                        .existsByVerificationIdAndCustomerId(
                                verificationId,
                                customerId
                        );

        if (phoneVerificationExists) {
            phoneVerificationService
                    .consumePasswordChangeVerification(
                            customerId,
                            verificationId
                    );

            return;
        }

        boolean emailVerificationExists =
                emailVerificationRepository
                        .existsByVerificationIdAndCustomerId(
                                verificationId,
                                customerId
                        );

        if (emailVerificationExists) {
            emailVerificationService
                    .consumePasswordChangeVerification(
                            customerId,
                            verificationId
                    );

            return;
        }

        throw new BusinessRuleException(
                "Phiên xác thực đổi mật khẩu không hợp lệ"
        );
    }
}