package org.akira.ladux.service;

import org.akira.ladux.config.DevOtpProperties;
import org.akira.ladux.dto.system.response.OtpSendResponse;
import org.akira.ladux.dto.user.request.PhoneRegisterRequest;
import org.akira.ladux.dto.user.request.PhoneVerifyRequest;
import org.akira.ladux.dto.user.response.CustomerResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.model.Customer;
import org.akira.ladux.model.PhoneVerification;
import org.akira.ladux.model.User;
import org.akira.ladux.model.UserPrincipal;
import org.akira.ladux.model.enums.PhoneVerificationStatus;
import org.akira.ladux.repository.CustomerRepository;
import org.akira.ladux.repository.PhoneVerificationRepository;
import org.akira.ladux.service.impl.DevPhoneOtpProvider;
import org.akira.ladux.service.impl.PhoneVerificationServiceImpl;
import org.akira.ladux.utils.PhoneNumberUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PhoneVerificationServiceImplTest {

    private static final int CUSTOMER_ID = 42;
    private static final String NORMALIZED_PHONE = "+84912345678";

    private PhoneVerificationRepository verificationRepository;
    private CustomerRepository customerRepository;
    private PhoneVerificationServiceImpl service;
    private Customer customer;

    @BeforeEach
    void setUp() {
        verificationRepository = mock(PhoneVerificationRepository.class);
        customerRepository = mock(CustomerRepository.class);

        DevOtpProperties properties = new DevOtpProperties();
        properties.setFixedCode("123456");

        service = new PhoneVerificationServiceImpl(
                verificationRepository,
                new PhoneNumberUtils(),
                customerRepository,
                new DevPhoneOtpProvider(properties)
        );

        User user = User.builder()
                .id(CUSTOMER_ID)
                .username("otp_user")
                .password("encoded-password")
                .isActive(true)
                .build();
        customer = Customer.builder()
                .id(CUSTOMER_ID)
                .user(user)
                .fullName("OTP User")
                .build();
        user.setCustomer(customer);

        UserPrincipal principal = new UserPrincipal(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        List.of()
                )
        );

        when(customerRepository.findById(CUSTOMER_ID))
                .thenReturn(Optional.of(customer));
        when(customerRepository.existsByPhoneAndIdNot(
                NORMALIZED_PHONE,
                CUSTOMER_ID
        )).thenReturn(false);
        when(verificationRepository.save(any(PhoneVerification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void sendPhoneOtp_createsPendingSession() {
        when(verificationRepository
                .findFirstByCustomerIdOrderByCreatedAtDesc(CUSTOMER_ID))
                .thenReturn(Optional.empty());

        OtpSendResponse response = service.sendPhoneOtp(
                new PhoneRegisterRequest("0912345678")
        );

        ArgumentCaptor<PhoneVerification> captor =
                ArgumentCaptor.forClass(PhoneVerification.class);
        org.mockito.Mockito.verify(verificationRepository).save(captor.capture());

        PhoneVerification saved = captor.getValue();
        assertEquals(NORMALIZED_PHONE, saved.getPhoneNumber());
        assertEquals(PhoneVerificationStatus.PENDING, saved.getStatus());
        assertEquals(0, saved.getFailedAttempts());
        assertTrue(saved.getProviderVerificationId().startsWith("FIXED-"));
        assertEquals(
                300,
                Duration.between(saved.getCreatedAt(), saved.getExpiresAt())
                        .getSeconds()
        );
        assertEquals(saved.getVerificationId(), response.verificationId());
        assertEquals("+84*****5678", response.maskedPhone());
        assertEquals(300, response.expiresInSeconds());
    }

    @Test
    void verifyPhoneOtp_updatesPhone_whenCodeIs123456() {
        PhoneVerification verification = pendingVerification();
        when(verificationRepository.findByVerificationIdAndCustomerId(
                "verification-1",
                CUSTOMER_ID
        )).thenReturn(Optional.of(verification));

        CustomerResponse response = service.verifyPhoneOtp(
                new PhoneVerifyRequest("verification-1", "123456")
        );

        assertEquals(NORMALIZED_PHONE, customer.getPhone());
        assertEquals(NORMALIZED_PHONE, response.phone());
        assertEquals(PhoneVerificationStatus.VERIFIED, verification.getStatus());
        assertNotNull(verification.getVerifiedAt());
    }

    @Test
    void verifyPhoneOtp_rejectsWrongCode_andInvalidatesAfterFiveAttempts() {
        PhoneVerification verification = pendingVerification();
        when(verificationRepository.findByVerificationIdAndCustomerId(
                "verification-1",
                CUSTOMER_ID
        )).thenReturn(Optional.of(verification));

        for (int attempt = 1; attempt <= 4; attempt++) {
            BusinessRuleException exception = assertThrows(
                    BusinessRuleException.class,
                    () -> service.verifyPhoneOtp(
                            new PhoneVerifyRequest("verification-1", "000000")
                    )
            );
            assertEquals("Mã OTP không chính xác", exception.getMessage());
            assertEquals(PhoneVerificationStatus.PENDING, verification.getStatus());
            assertEquals(attempt, verification.getFailedAttempts());
        }

        BusinessRuleException exception = assertThrows(
                BusinessRuleException.class,
                () -> service.verifyPhoneOtp(
                        new PhoneVerifyRequest("verification-1", "000000")
                )
        );

        assertTrue(exception.getMessage().contains("quá 5 lần"));
        assertEquals(5, verification.getFailedAttempts());
        assertEquals(
                PhoneVerificationStatus.INVALIDATED,
                verification.getStatus()
        );
        assertNull(customer.getPhone());
    }

    @Test
    void verifyPhoneOtp_marksExpiredSession() {
        PhoneVerification verification = pendingVerification();
        verification.setExpiresAt(Instant.now().minusSeconds(1));
        when(verificationRepository.findByVerificationIdAndCustomerId(
                "verification-1",
                CUSTOMER_ID
        )).thenReturn(Optional.of(verification));

        BusinessRuleException exception = assertThrows(
                BusinessRuleException.class,
                () -> service.verifyPhoneOtp(
                        new PhoneVerifyRequest("verification-1", "123456")
                )
        );

        assertEquals("Mã OTP đã hết hạn", exception.getMessage());
        assertEquals(PhoneVerificationStatus.EXPIRED, verification.getStatus());
    }

    @Test
    void sendPhoneOtp_enforcesResendCooldown() {
        PhoneVerification previous = pendingVerification();
        previous.setCreatedAt(Instant.now());
        when(verificationRepository
                .findFirstByCustomerIdOrderByCreatedAtDesc(CUSTOMER_ID))
                .thenReturn(Optional.of(previous));

        BusinessRuleException exception = assertThrows(
                BusinessRuleException.class,
                () -> service.sendPhoneOtp(
                        new PhoneRegisterRequest("0912345678")
                )
        );

        assertTrue(exception.getMessage().contains("trước khi gửi lại OTP"));
    }

    private PhoneVerification pendingVerification() {
        Instant now = Instant.now();
        return PhoneVerification.builder()
                .verificationId("verification-1")
                .providerVerificationId("FIXED-provider-id")
                .customerId(CUSTOMER_ID)
                .phoneNumber(NORMALIZED_PHONE)
                .status(PhoneVerificationStatus.PENDING)
                .failedAttempts(0)
                .createdAt(now.minusSeconds(30))
                .expiresAt(now.plusSeconds(270))
                .build();
    }
}
