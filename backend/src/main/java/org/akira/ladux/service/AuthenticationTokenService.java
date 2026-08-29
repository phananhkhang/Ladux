package org.akira.ladux.service;

import org.akira.ladux.model.User;

/** The sole local-password/MFA path that creates an access + refresh token pair. */
public interface AuthenticationTokenService {

    IssuedAuthenticationTokens issueAuthenticationTokens(User user);

    record IssuedAuthenticationTokens(String accessToken, String refreshToken) {
    }
}
