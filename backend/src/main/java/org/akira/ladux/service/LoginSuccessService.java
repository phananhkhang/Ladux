package org.akira.ladux.service;

import org.akira.ladux.model.User;

import jakarta.servlet.http.HttpServletRequest;

public interface LoginSuccessService {

    CompletedLogin complete(User user, HttpServletRequest request, boolean mfaUsed);

    record CompletedLogin(
            AuthenticationTokenService.IssuedAuthenticationTokens tokens,
            String deviceCookieToSet
    ) {
    }
}
