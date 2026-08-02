package org.akira.ladux.service.impl;

import lombok.RequiredArgsConstructor;
import org.akira.ladux.dto.internal.otp.ProviderOtpResponse;
import org.akira.ladux.dto.system.response.OtpSendResponse;
import org.akira.ladux.dto.user.request.PhoneRegisterRequest;
import org.akira.ladux.dto.user.request.PhoneVerifyRequest;
import org.akira.ladux.dto.user.response.CustomerResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.exception.ResourceNotFoundException;
import org.akira.ladux.model.Customer;
import org.akira.ladux.model.PhoneVerification;
import org.akira.ladux.model.enums.PhoneVerificationStatus;
import org.akira.ladux.repository.CustomerRepository;
import org.akira.ladux.repository.PhoneVerificationRepository;
import org.akira.ladux.service.PhoneOtpProvider;
import org.akira.ladux.service.PhoneVerificationService;
import org.akira.ladux.utils.PhoneNumberUtils;
import org.akira.ladux.utils.SecurityUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhoneVerificationServiceImpl
        implements PhoneVerificationService {

    private static final int OTP_EXPIRES_IN_SECONDS = 300;
    private static final int OTP_RESEND_COOLDOWN_SECONDS = 60;
    private static final int OTP_MAX_FAILED_ATTEMPTS = 5;

    private final PhoneVerificationRepository repo;
    private final PhoneNumberUtils phoneNumberUtils;
    private final CustomerRepository customerRepository;
    private final PhoneOtpProvider phoneOtpProvider;

    @Override
    @Transactional
    public OtpSendResponse sendPhoneOtp(
            PhoneRegisterRequest request
    ) {
        Integer customerId = SecurityUtils.getCurrentUserId();

        if (customerId == null) {
            throw new BusinessRuleException(
                    "Không tìm thấy người dùng đang đăng nhập"
            );
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hồ sơ khách hàng với userId = "
                                + customerId
                ));

        String normalizedPhone;
        try {
            normalizedPhone = phoneNumberUtils.normalize(request.phone());
        } catch (IllegalArgumentException exception) {
            throw new BusinessRuleException(exception.getMessage());
        }

        if (normalizedPhone.equals(customer.getPhone())) {
            throw new BusinessRuleException(
                    "Số điện thoại này đã được gắn với tài khoản"
            );
        }

        if (customerRepository.existsByPhoneAndIdNot(
                normalizedPhone,
                customerId
        )) {
            throw new BusinessRuleException(
                    "Số điện thoại đã được tài khoản khác sử dụng"
            );
        }

        Instant now = Instant.now();

        repo.findFirstByCustomerIdOrderByCreatedAtDesc(customerId)
                .ifPresent(previous ->
                        validateResendCooldown(previous, now)
                );

        repo.invalidatePendingByCustomerId(
                customerId,
                PhoneVerificationStatus.INVALIDATED
        );

        /*
         * Nhà cung cấp tự tạo OTP và gửi SMS đến SIM.
         * Backend không biết và không lưu mã OTP.
         */
        ProviderOtpResponse providerResponse;

        try {
            providerResponse =
                    phoneOtpProvider.sendOtp(normalizedPhone);
        } catch (Exception exception) {
            throw new BusinessRuleException(
                    "Không thể gửi mã OTP. Vui lòng thử lại sau"
            );
        }

        if (providerResponse == null
                || providerResponse.providerVerificationId() == null
                || providerResponse.providerVerificationId().isBlank()) {
            throw new BusinessRuleException(
                    "Nhà cung cấp OTP không trả về mã xác thực hợp lệ"
            );
        }

        PhoneVerification verification =
                PhoneVerification.builder()
                        .verificationId(UUID.randomUUID().toString())
                        .providerVerificationId(
                                providerResponse.providerVerificationId()
                        )
                        .customerId(customerId)
                        .phoneNumber(normalizedPhone)
                        .status(PhoneVerificationStatus.PENDING)
                        .failedAttempts(0)
                        .createdAt(now)
                        .expiresAt(
                                now.plusSeconds(
                                        OTP_EXPIRES_IN_SECONDS
                                )
                        )
                        .build();

        repo.save(verification);

        return new OtpSendResponse(
                verification.getVerificationId(),
                phoneNumberUtils.maskKeepCountryCode(
                        normalizedPhone
                ),
                OTP_EXPIRES_IN_SECONDS
        );
    }

    private void validateResendCooldown(
            PhoneVerification previous,
            Instant now
    ) {
        Instant nextAllowedAt = previous.getCreatedAt()
                .plusSeconds(OTP_RESEND_COOLDOWN_SECONDS);

        if (now.isBefore(nextAllowedAt)) {
            long remainingSeconds = Duration.between(
                    now,
                    nextAllowedAt
            ).toSeconds();

            throw new BusinessRuleException(
                    "Vui lòng đợi " + remainingSeconds
                            + " giây trước khi gửi lại OTP"
            );
        }
    }
    @Override
    @Transactional(noRollbackFor = BusinessRuleException.class)
    @CacheEvict(value = "users", allEntries = true)
    public CustomerResponse verifyPhoneOtp(
            PhoneVerifyRequest request
    ) {
        Integer customerId = SecurityUtils.getCurrentUserId();

        if (customerId == null) {
            throw new BusinessRuleException(
                    "Không tìm thấy người dùng đang đăng nhập"
            );
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy hồ sơ khách hàng với userId = "
                                + customerId
                ));

        PhoneVerification verification = repo
                .findByVerificationIdAndCustomerId(
                        request.verificationId(),
                        customerId
                )
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phiên xác thực số điện thoại"
                ));

        Instant now = Instant.now();

        if (verification.getStatus()
                != PhoneVerificationStatus.PENDING) {
            throw new BusinessRuleException(
                    "Phiên xác thực không còn hiệu lực"
            );
        }

        if (!now.isBefore(verification.getExpiresAt())) {
            verification.setStatus(
                    PhoneVerificationStatus.EXPIRED
            );
            repo.save(verification);

            throw new BusinessRuleException(
                    "Mã OTP đã hết hạn"
            );
        }

        boolean valid;

        try {
            valid = phoneOtpProvider.verifyOtp(
                    verification.getProviderVerificationId(),
                    request.otp()
            );
        } catch (Exception exception) {
            throw new BusinessRuleException(
                    "Không thể xác minh mã OTP. Vui lòng thử lại sau"
            );
        }

        if (!valid) {
            int failedAttempts = verification.getFailedAttempts() + 1;
            verification.setFailedAttempts(failedAttempts);

            if (failedAttempts >= OTP_MAX_FAILED_ATTEMPTS) {
                verification.setStatus(
                        PhoneVerificationStatus.INVALIDATED
                );
            }
            repo.save(verification);

            if (failedAttempts >= OTP_MAX_FAILED_ATTEMPTS) {
                throw new BusinessRuleException(
                        "Bạn đã nhập sai OTP quá 5 lần. Vui lòng gửi lại mã mới"
                );
            }

            throw new BusinessRuleException(
                    "Mã OTP không chính xác"
            );
        }

        String verifiedPhone = verification.getPhoneNumber();

        if (customerRepository.existsByPhoneAndIdNot(
                verifiedPhone,
                customerId
        )) {
            verification.setStatus(
                    PhoneVerificationStatus.INVALIDATED
            );
            repo.save(verification);

            throw new BusinessRuleException(
                    "Số điện thoại đã được tài khoản khác sử dụng"
            );
        }

        customer.setPhone(verifiedPhone);

        verification.setStatus(
                PhoneVerificationStatus.VERIFIED
        );
        verification.setVerifiedAt(now);

        customerRepository.save(customer);
        repo.save(verification);

        return CustomerResponse.fromEntity(customer);
    }
}
