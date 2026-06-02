package org.akira.auratech.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {
    private final String cookieName;
    private final String cookiePath;
    private final String sameSite;
    private final boolean secure;
    private final Duration maxAge;

    public AuthCookieService(
            @Value("${app.auth.cookie.name:AUTH_TOKEN}") String cookieName,
            @Value("${app.auth.cookie.path:/}") String cookiePath,
            @Value("${app.auth.cookie.same-site:Strict}") String sameSite,
            @Value("${app.auth.cookie.secure:false}") boolean secure,
            @Value("${app.auth.cookie.max-age-seconds:36000}") long maxAgeSeconds
    ) {
        this.cookieName = cookieName;
        this.cookiePath = cookiePath;
        this.sameSite = sameSite;
        this.secure = secure;
        this.maxAge = Duration.ofSeconds(maxAgeSeconds);
    }

    public String cookieName() {
        return cookieName;
    }

    public ResponseCookie createAuthCookie(String token) {
        return baseCookie(token)
                .maxAge(maxAge)
                .build();
    }

    public ResponseCookie clearAuthCookie() {
        return baseCookie("")
                .maxAge(Duration.ZERO)
                .build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(cookieName, value)
                .httpOnly(true)
                .secure(secure)
                .path(cookiePath)
                .sameSite(sameSite);
    }
}
