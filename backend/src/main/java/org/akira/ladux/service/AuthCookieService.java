package org.akira.ladux.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

/**
 * Phat sinh cookie HttpOnly cho access token va refresh token.
 * - Access cookie: path "/", song ngan (= han access token).
 * - Refresh cookie: path "/api/v1/auth" (chi gui kem cho endpoint auth), song dai (= han refresh token).
 */
@Service
public class AuthCookieService {

    private final String accessCookieName;
    private final String refreshCookieName;
    private final String accessCookiePath;
    private final String refreshCookiePath;
    private final String sameSite;
    private final boolean secure;
    private final Duration accessMaxAge;
    private final Duration refreshMaxAge;

    public AuthCookieService(
            @Value("${app.auth.cookie.name:AUTH_TOKEN}") String accessCookieName,
            @Value("${app.auth.cookie.refresh-name:REFRESH_TOKEN}") String refreshCookieName,
            @Value("${app.auth.cookie.path:/}") String accessCookiePath,
            @Value("${app.auth.cookie.refresh-path:/api/v1/auth}") String refreshCookiePath,
            @Value("${app.auth.cookie.same-site:Strict}") String sameSite,
            @Value("${app.auth.cookie.secure:false}") boolean secure,
            @Value("${app.jwt.access-expiration:900000}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration:604800000}") long refreshExpirationMs
    ) {
        this.accessCookieName = accessCookieName;
        this.refreshCookieName = refreshCookieName;
        this.accessCookiePath = accessCookiePath;
        this.refreshCookiePath = refreshCookiePath;
        this.sameSite = sameSite;
        this.secure = secure;
        this.accessMaxAge = Duration.ofMillis(accessExpirationMs);
        this.refreshMaxAge = Duration.ofMillis(refreshExpirationMs);
    }

    public String accessCookieName() {
        return accessCookieName;
    }

    public String refreshCookieName() {
        return refreshCookieName;
    }

    public ResponseCookie createAccessCookie(String token) {
        return baseCookie(accessCookieName, token, accessCookiePath).maxAge(accessMaxAge).build();
    }

    public ResponseCookie clearAccessCookie() {
        return baseCookie(accessCookieName, "", accessCookiePath).maxAge(Duration.ZERO).build();
    }

    public ResponseCookie createRefreshCookie(String token) {
        return baseCookie(refreshCookieName, token, refreshCookiePath).maxAge(refreshMaxAge).build();
    }

    public ResponseCookie clearRefreshCookie() {
        return baseCookie(refreshCookieName, "", refreshCookiePath).maxAge(Duration.ZERO).build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String name, String value, String path) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .path(path)
                .sameSite(sameSite);
    }
}
