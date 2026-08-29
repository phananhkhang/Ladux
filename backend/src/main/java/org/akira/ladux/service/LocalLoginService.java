package org.akira.ladux.service;

import org.akira.ladux.dto.user.request.LoginRequest;
import org.akira.ladux.model.User;

import jakarta.servlet.http.HttpServletRequest;

public interface LocalLoginService {

    PasswordLoginResult verifyPassword(LoginRequest request, boolean adminLogin, HttpServletRequest servletRequest);

    record PasswordLoginResult(User user, String challengeId) {
        public boolean mfaRequired() {
            return challengeId != null;
        }
    }
}
