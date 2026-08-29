package org.akira.ladux.controller;

import java.util.Map;

import org.akira.ladux.dto.user.request.LoginRequest;
import org.akira.ladux.dto.user.request.MfaVerifyRequest;
import org.akira.ladux.dto.user.request.RegisterRequest;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.LocalLoginService;
import org.akira.ladux.service.LoginSuccessService;
import org.akira.ladux.service.MfaVerificationService;
import org.akira.ladux.service.RefreshTokenCookieService;
import org.akira.ladux.service.RefreshTokenService;
import org.akira.ladux.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final LocalLoginService localLoginService;
    private final MfaVerificationService mfaVerificationService;
    private final LoginSuccessService loginSuccessService;
    private final JwtService jwtService;
    private final RefreshTokenCookieService refreshTokenCookieService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping({"/register", "/register/"})
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(userService.savedUser(request), HttpStatus.CREATED);
    }

    @PostMapping({"/login", "/login/"})
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest
    ) {
        LocalLoginService.PasswordLoginResult result = localLoginService.verifyPassword(request, false, servletRequest);
        if (result.mfaRequired()) {
            return ResponseEntity.ok(Map.of("mfaRequired", true, "challengeId", result.challengeId()));
        }
        return successfulLogin(result.user(), servletRequest);
    }

    @PostMapping({"/mfa/verify", "/mfa/verify/"})
    public ResponseEntity<Map<String, Object>> verifyMfa(
            @Valid @RequestBody MfaVerifyRequest request,
            HttpServletRequest servletRequest
    ) {
        MfaVerificationService.VerifiedMfaLogin verified = mfaVerificationService.verify(request, false, servletRequest);
        return successfulLogin(verified.user(), servletRequest, true);
    }

    @PostMapping({"/refresh", "/refresh/"})
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request) {
        String rawRefresh = readCookie(request, refreshTokenCookieService.refreshCookieName());
        RefreshToken rotated = refreshTokenService.verifyAndRotate(rawRefresh);
        User user = rotated.getUser();
        String newAccessToken = jwtService.generateAccessToken(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.createRefreshCookie(rotated.getToken()).toString())
                .body(Map.of("message", "Token refreshed successfully", "accessToken", newAccessToken, "tokenType", "Bearer"));
    }

    @PostMapping({"/logout", "/logout/"})
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        refreshTokenService.revokeSessionAndBump(readCookie(request, refreshTokenCookieService.refreshCookieName()));
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.clearRefreshCookie().toString())
                .build();
    }

    private ResponseEntity<Map<String, Object>> successfulLogin(User user, HttpServletRequest request) {
        return successfulLogin(user, request, false);
    }

    private ResponseEntity<Map<String, Object>> successfulLogin(User user, HttpServletRequest request, boolean mfaUsed) {
        LoginSuccessService.CompletedLogin completed = loginSuccessService.complete(user, request, mfaUsed);
        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        refreshTokenCookieService.createRefreshCookie(completed.tokens().refreshToken()).toString());
        if (completed.deviceCookieToSet() != null) {
            response.header(HttpHeaders.SET_COOKIE, completed.deviceCookieToSet());
        }
        return response.body(Map.of(
                "message", "Login successful",
                "userId", String.valueOf(user.getId()),
                "username", user.getUsername(),
                "accessToken", completed.tokens().accessToken(),
                "tokenType", "Bearer"
        ));
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
