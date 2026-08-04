package org.akira.ladux.config;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.akira.ladux.service.AuthCookieService;
import org.akira.ladux.service.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;

class JwtFilterSessionScopeTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void adminRequestUsesAdminCookieWhenBothSessionsExist() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        AuthCookieService cookieService = cookieService();
        JwtFilter filter = new JwtFilter(jwtService, mock(UserDetailsService.class), cookieService);
        MockHttpServletRequest request = request("/api/v1/admin/orders");

        when(jwtService.extractUsername("admin-token")).thenThrow(new JwtException("test invalid token"));
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        verify(jwtService).extractUsername("admin-token");
    }

    @Test
    void storefrontRequestUsesUserCookieWhenBothSessionsExist() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        AuthCookieService cookieService = cookieService();
        JwtFilter filter = new JwtFilter(jwtService, mock(UserDetailsService.class), cookieService);
        MockHttpServletRequest request = request("/api/v1/user-addresses");

        when(jwtService.extractUsername("user-token")).thenThrow(new JwtException("test invalid token"));
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        verify(jwtService).extractUsername("user-token");
    }

    private MockHttpServletRequest request(String uri) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
        request.setCookies(
                new Cookie("AUTH_TOKEN", "user-token"),
                new Cookie("ADMIN_AUTH_TOKEN", "admin-token")
        );
        return request;
    }

    private AuthCookieService cookieService() {
        AuthCookieService service = mock(AuthCookieService.class);
        when(service.accessCookieName()).thenReturn("AUTH_TOKEN");
        when(service.adminAccessCookieName()).thenReturn("ADMIN_AUTH_TOKEN");
        when(service.clearAccessCookie()).thenReturn(
                ResponseCookie.from("AUTH_TOKEN", "").path("/").maxAge(0).build()
        );
        when(service.clearAdminAccessCookie()).thenReturn(
                ResponseCookie.from("ADMIN_AUTH_TOKEN", "").path("/api/v1/admin").maxAge(0).build()
        );
        return service;
    }
}
