package org.akira.ladux.service.impl;

import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;
import org.akira.ladux.service.AuthenticationTokenService;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.RefreshTokenService;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationTokenServiceImpl implements AuthenticationTokenService {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    public IssuedAuthenticationTokens issueAuthenticationTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);
        return new IssuedAuthenticationTokens(accessToken, refreshToken.getToken());
    }
}
