package org.akira.ladux.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

/**
 * Phat sinh cookie HttpOnly cho hai pham vi xac thuc doc lap:
 * - Storefront: AUTH_TOKEN / REFRESH_TOKEN.
 * - Admin: ADMIN_AUTH_TOKEN / ADMIN_REFRESH_TOKEN.
 *
 * Hai cap cookie khac ten va khac path de dang nhap admin khong ghi de phien
 * storefront khi ca hai ung dung chay tren cung mot origin.
 */
@Service
public class AuthCookieService {

    private final String accessCookieName;
    private final String refreshCookieName;
    private final String adminAccessCookieName;
    private final String adminRefreshCookieName;
    private final String accessCookiePath;
    private final String refreshCookiePath;
    private final String adminAccessCookiePath;
    private final String adminRefreshCookiePath;
    private final String sameSite;
    private final boolean secure;
    private final Duration accessMaxAge;
    private final Duration refreshMaxAge;

    public AuthCookieService(
            @Value("${app.auth.cookie.name:AUTH_TOKEN}") String accessCookieName,
            @Value("${app.auth.cookie.refresh-name:REFRESH_TOKEN}") String refreshCookieName,
            @Value("${app.auth.cookie.admin-name:ADMIN_AUTH_TOKEN}") String adminAccessCookieName,
            @Value("${app.auth.cookie.admin-refresh-name:ADMIN_REFRESH_TOKEN}") String adminRefreshCookieName,
            @Value("${app.auth.cookie.path:/}") String accessCookiePath,
            @Value("${app.auth.cookie.refresh-path:/api/v1/auth}") String refreshCookiePath,
            @Value("${app.auth.cookie.admin-path:/api/v1/admin}") String adminAccessCookiePath,
            @Value("${app.auth.cookie.admin-refresh-path:/api/v1/admin/auth}") String adminRefreshCookiePath,
            @Value("${app.auth.cookie.same-site:Strict}") String sameSite,
            @Value("${app.auth.cookie.secure:false}") boolean secure,
            @Value("${app.jwt.access-expiration:900000}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration:604800000}") long refreshExpirationMs
    ) {
        this.accessCookieName = accessCookieName;
        this.refreshCookieName = refreshCookieName;
        this.adminAccessCookieName = adminAccessCookieName;
        this.adminRefreshCookieName = adminRefreshCookieName;
        this.accessCookiePath = accessCookiePath;
        this.refreshCookiePath = refreshCookiePath;
        this.adminAccessCookiePath = adminAccessCookiePath;
        this.adminRefreshCookiePath = adminRefreshCookiePath;
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

    public String adminAccessCookieName() {
        return adminAccessCookieName;
    }

    public String adminRefreshCookieName() {
        return adminRefreshCookieName;
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

    public ResponseCookie createAdminAccessCookie(String token) {
        return baseCookie(adminAccessCookieName, token, adminAccessCookiePath).maxAge(accessMaxAge).build();
    }

    public ResponseCookie clearAdminAccessCookie() {
        return baseCookie(adminAccessCookieName, "", adminAccessCookiePath).maxAge(Duration.ZERO).build();
    }

    public ResponseCookie createAdminRefreshCookie(String token) {
        return baseCookie(adminRefreshCookieName, token, adminRefreshCookiePath).maxAge(refreshMaxAge).build();
    }

    public ResponseCookie clearAdminRefreshCookie() {
        return baseCookie(adminRefreshCookieName, "", adminRefreshCookiePath).maxAge(Duration.ZERO).build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String name, String value, String path) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .path(path)
                .sameSite(sameSite);
    }
}
