package org.akira.ladux.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

class AuthCookieServiceTest {

    private final AuthCookieService service = new AuthCookieService(
            "AUTH_TOKEN",
            "REFRESH_TOKEN",
            "ADMIN_AUTH_TOKEN",
            "ADMIN_REFRESH_TOKEN",
            "/",
            "/api/v1/auth",
            "/api/v1/admin",
            "/api/v1/admin/auth",
            "Strict",
            false,
            900_000,
            604_800_000
    );

    @Test
    void storefrontAndAdminCookiesUseIndependentNamesAndPaths() {
        ResponseCookie userAccess = service.createAccessCookie("user-access");
        ResponseCookie userRefresh = service.createRefreshCookie("user-refresh");
        ResponseCookie adminAccess = service.createAdminAccessCookie("admin-access");
        ResponseCookie adminRefresh = service.createAdminRefreshCookie("admin-refresh");

        assertEquals("AUTH_TOKEN", userAccess.getName());
        assertEquals("/", userAccess.getPath());
        assertEquals("REFRESH_TOKEN", userRefresh.getName());
        assertEquals("/api/v1/auth", userRefresh.getPath());

        assertEquals("ADMIN_AUTH_TOKEN", adminAccess.getName());
        assertEquals("/api/v1/admin", adminAccess.getPath());
        assertEquals("ADMIN_REFRESH_TOKEN", adminRefresh.getName());
        assertEquals("/api/v1/admin/auth", adminRefresh.getPath());

        assertNotEquals(userAccess.getName(), adminAccess.getName());
        assertNotEquals(userRefresh.getName(), adminRefresh.getName());
        assertTrue(userAccess.isHttpOnly());
        assertTrue(adminAccess.isHttpOnly());
    }
}
