package org.akira.ladux.config;

import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;
import org.akira.ladux.service.AuthCookieService;
import org.akira.ladux.service.GoogleOAuth2UserService;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OAuth2SuccessHandlerTest {

    private JwtService jwtService;
    private AuthCookieService authCookieService;
    private RefreshTokenService refreshTokenService;
    private GoogleOAuth2UserService googleOAuth2UserService;
    private OAuth2SuccessHandler successHandler;

    @BeforeEach
    void setUp() {
        jwtService = mock(JwtService.class);
        authCookieService = mock(AuthCookieService.class);
        refreshTokenService = mock(RefreshTokenService.class);
        googleOAuth2UserService = mock(GoogleOAuth2UserService.class);

        OAuth2FailureHandler failureHandler = new OAuth2FailureHandler();
        ReflectionTestUtils.setField(
                failureHandler,
                "failureRedirectUrl",
                "http://localhost:5173/login?oauth2Error=true"
        );

        successHandler = new OAuth2SuccessHandler(
                jwtService,
                authCookieService,
                refreshTokenService,
                googleOAuth2UserService,
                failureHandler
        );
        ReflectionTestUtils.setField(
                successHandler,
                "successRedirectUrl",
                "http://localhost:5173/auth/oauth2/success"
        );
    }

    @Test
    void onAuthenticationSuccess_setsHttpOnlyCookiesAndRedirectsToFrontend() throws Exception {
        User user = User.builder()
                .id(7)
                .username("alice")
                .password("encoded-random")
                .build();
        RefreshToken refreshToken = RefreshToken.builder()
                .token("refresh-token")
                .user(user)
                .build();

        when(googleOAuth2UserService.loginOrRegister(
                "google-subject",
                "alice@example.com",
                true,
                "Alice",
                "https://example.com/alice.png"
        )).thenReturn(user);
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(refreshTokenService.create(user)).thenReturn(refreshToken);
        when(authCookieService.createAccessCookie("access-token"))
                .thenReturn(ResponseCookie.from("AUTH_TOKEN", "access-token").httpOnly(true).build());
        when(authCookieService.createRefreshCookie("refresh-token"))
                .thenReturn(ResponseCookie.from("REFRESH_TOKEN", "refresh-token").httpOnly(true).build());

        MockHttpServletResponse response = invokeHandler(oAuth2Authentication());

        assertEquals(302, response.getStatus());
        assertEquals(
                "http://localhost:5173/auth/oauth2/success",
                response.getRedirectedUrl()
        );
        assertEquals(2, response.getHeaders(HttpHeaders.SET_COOKIE).size());
        assertTrue(response.getHeaders(HttpHeaders.SET_COOKIE).stream()
                .allMatch(cookie -> cookie.contains("HttpOnly")));
    }

    @Test
    void onAuthenticationSuccess_redirectsToFailureWhenAccountCannotBeLinked() throws Exception {
        when(googleOAuth2UserService.loginOrRegister(
                any(), any(), any(Boolean.class), any(), any()
        )).thenThrow(new BusinessRuleException("Tài khoản đã bị vô hiệu hóa"));

        MockHttpServletResponse response = invokeHandler(oAuth2Authentication());

        assertEquals(302, response.getStatus());
        assertEquals(
                "http://localhost:5173/login?oauth2Error=true&reason=google_login_failed",
                response.getRedirectedUrl()
        );
        verify(jwtService, never()).generateAccessToken(any(User.class));
    }

    private MockHttpServletResponse invokeHandler(OAuth2User principal) throws Exception {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        successHandler.onAuthenticationSuccess(request, response, authentication);
        return response;
    }

    private OAuth2User oAuth2Authentication() {
        return new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")),
                Map.of(
                        "sub", "google-subject",
                        "email", "alice@example.com",
                        "email_verified", true,
                        "name", "Alice",
                        "picture", "https://example.com/alice.png"
                ),
                "sub"
        );
    }
}
