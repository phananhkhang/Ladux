package org.akira.ladux.service;

import org.springframework.http.ResponseCookie;

public interface RefreshTokenCookieService {

    String refreshCookieName();

    String adminRefreshCookieName();

    ResponseCookie createRefreshCookie(String token);

    ResponseCookie clearRefreshCookie();

    ResponseCookie createAdminRefreshCookie(String token);

    ResponseCookie clearAdminRefreshCookie();
}
