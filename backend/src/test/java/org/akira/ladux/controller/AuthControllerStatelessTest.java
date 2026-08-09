package org.akira.ladux.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.akira.ladux.controller.admin.AdminAuthController;
import org.akira.ladux.dto.user.request.LoginRequest;
import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.Role;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.RoleName;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.RefreshTokenCookieService;
import org.akira.ladux.service.RefreshTokenService;
import org.akira.ladux.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;

class AuthControllerStatelessTest {

    @Test
    void storefrontLoginReturnsAccessTokenAndSetsOnlyRefreshCookie() {
        User user = user(RoleName.CUSTOMER);
        UserRepository userRepository = mock(UserRepository.class);
        JwtService jwtService = mock(JwtService.class);
        RefreshTokenService refreshTokenService = mock(RefreshTokenService.class);
        RefreshTokenCookieService cookieService = mock(RefreshTokenCookieService.class);
        when(userRepository.findByUsername("customer"))
                .thenReturn(Optional.empty(), Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("storefront-access");
        when(refreshTokenService.create(user)).thenReturn(refreshToken(user, "storefront-refresh"));
        when(cookieService.createRefreshCookie("storefront-refresh"))
                .thenReturn(refreshCookie("REFRESH_TOKEN", "storefront-refresh", "/api/v1/auth"));

        AuthController controller = new AuthController(
                mock(UserService.class),
                mock(AuthenticationManager.class),
                jwtService,
                cookieService,
                refreshTokenService,
                userRepository
        );

        ResponseEntity<Map<String, String>> response = controller.login(new LoginRequest("customer", "password"));

        assertEquals("storefront-access", response.getBody().get("accessToken"));
        assertEquals("Bearer", response.getBody().get("tokenType"));
        assertEquals(1, response.getHeaders().get(HttpHeaders.SET_COOKIE).size());
        assertTrue(response.getHeaders().getFirst(HttpHeaders.SET_COOKIE).startsWith("REFRESH_TOKEN="));
        assertFalse(response.getHeaders().getFirst(HttpHeaders.SET_COOKIE).contains("AUTH_TOKEN="));
    }

    @Test
    void adminLoginReturnsAccessTokenAndSetsOnlyAdminRefreshCookie() {
        User user = user(RoleName.ADMIN);
        UserRepository userRepository = mock(UserRepository.class);
        JwtService jwtService = mock(JwtService.class);
        RefreshTokenService refreshTokenService = mock(RefreshTokenService.class);
        RefreshTokenCookieService cookieService = mock(RefreshTokenCookieService.class);
        when(userRepository.findByUsername("admin"))
                .thenReturn(Optional.empty(), Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn("admin-access");
        when(refreshTokenService.create(user)).thenReturn(refreshToken(user, "admin-refresh"));
        when(cookieService.createAdminRefreshCookie("admin-refresh"))
                .thenReturn(refreshCookie("ADMIN_REFRESH_TOKEN", "admin-refresh", "/api/v1/admin/auth"));

        AdminAuthController controller = new AdminAuthController(
                mock(UserService.class),
                mock(AuthenticationManager.class),
                jwtService,
                cookieService,
                refreshTokenService,
                userRepository
        );

        ResponseEntity<Map<String, String>> response = controller.login(new LoginRequest("admin", "password"));

        assertEquals("admin-access", response.getBody().get("accessToken"));
        assertEquals(1, response.getHeaders().get(HttpHeaders.SET_COOKIE).size());
        assertTrue(response.getHeaders().getFirst(HttpHeaders.SET_COOKIE).startsWith("ADMIN_REFRESH_TOKEN="));
        assertFalse(response.getHeaders().getFirst(HttpHeaders.SET_COOKIE).contains("ADMIN_AUTH_TOKEN="));
    }

    private User user(RoleName roleName) {
        return User.builder()
                .id(7)
                .username(roleName == RoleName.ADMIN ? "admin" : "customer")
                .password("unused")
                .roles(Set.of(Role.builder().name(roleName).build()))
                .build();
    }

    private RefreshToken refreshToken(User user, String token) {
        return RefreshToken.builder().token(token).user(user).build();
    }

    private ResponseCookie refreshCookie(String name, String value, String path) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path(path)
                .build();
    }
}
