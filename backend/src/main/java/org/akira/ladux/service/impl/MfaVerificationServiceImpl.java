package org.akira.ladux.service.impl;

import org.akira.ladux.dto.user.request.MfaVerifyRequest;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.SecurityEventType;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.LoginRateLimitService;
import org.akira.ladux.service.MfaChallengeService;
import org.akira.ladux.service.MfaService;
import org.akira.ladux.service.MfaVerificationService;
import org.akira.ladux.service.SecurityEventService;
import org.akira.ladux.utils.ClientIpUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MfaVerificationServiceImpl implements MfaVerificationService {

    private final MfaChallengeService mfaChallengeService;
    private final LoginRateLimitService loginRateLimitService;
    private final UserRepository userRepository;
    private final MfaService mfaService;
    private final SecurityEventService securityEventService;

    @Override
    public VerifiedMfaLogin verify(
            MfaVerifyRequest request,
            boolean adminSession,
            HttpServletRequest servletRequest
    ) {
        String ipAddress = ClientIpUtils.getClientIp(servletRequest);
        String userAgent = servletRequest == null ? null : servletRequest.getHeader("User-Agent");
        MfaChallengeService.MfaChallenge challenge = mfaChallengeService.findActive(request.challengeId())
                .orElseThrow(this::denied);
        if (challenge.adminSession() != adminSession) {
            throw denied();
        }
        User user = userRepository.findById(challenge.userId()).orElseThrow(this::denied);
        loginRateLimitService.checkMfaAccountAndChallenge(user.getUsername(), request.challengeId());

        boolean valid;
        try {
            valid = mfaService.verifyTotp(user, request.code());
        } catch (BusinessRuleException exception) {
            valid = false;
        }
        MfaChallengeService.MfaChallengeAttempt attempt = mfaChallengeService.complete(request.challengeId(), valid);
        if (!valid || attempt != MfaChallengeService.MfaChallengeAttempt.SUCCESS) {
            securityEventService.record(user, SecurityEventType.MFA_FAILED, ipAddress, userAgent, false);
            throw denied();
        }

        securityEventService.record(user, SecurityEventType.MFA_SUCCESS, ipAddress, userAgent, true);
        return new VerifiedMfaLogin(user, challenge.adminSession());
    }

    private AccessDeniedException denied() {
        return new AccessDeniedException("MFA challenge hoac ma xac thuc khong hop le");
    }
}
