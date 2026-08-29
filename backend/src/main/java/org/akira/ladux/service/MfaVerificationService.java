package org.akira.ladux.service;

import org.akira.ladux.dto.user.request.MfaVerifyRequest;
import org.akira.ladux.model.User;

import jakarta.servlet.http.HttpServletRequest;

public interface MfaVerificationService {

    VerifiedMfaLogin verify(MfaVerifyRequest request, boolean adminSession, HttpServletRequest servletRequest);

    record VerifiedMfaLogin(User user, boolean adminSession) {
    }
}
