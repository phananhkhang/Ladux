package org.akira.ladux.controller;

import java.util.Map;

import org.akira.ladux.dto.user.request.LoginRequest;
import org.akira.ladux.dto.user.request.RegisterRequest;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.RefreshTokenCookieService;
import org.akira.ladux.service.RefreshTokenService;
import org.akira.ladux.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// API xac thuc — dang ky, dang nhap, refresh token, logout.
// Access JWT tra trong response body; refresh token opaque nam trong HttpOnly cookie.
// Logout: revoke refresh token + tang tokenVersion -> access token cu chet tuc thi.
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final RefreshTokenCookieService refreshTokenCookieService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @PostMapping({"/register", "/register/"})
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(userService.savedUser(request), HttpStatus.CREATED);
    }
    @PostMapping({"/login", "/login/"})
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        String username = request.username().trim();
        User existing = userRepository.findByUsername(username).orElse(null);
        if (existing != null && !isBcryptHash(existing.getPassword())) {
            throw new BusinessRuleException(
                    "Username '" + username + "' la user seed khong co mat khau dang nhap hop le. "
                            + "Hay dang ky tai khoan moi hoac cap nhat password BCrypt tu cong cu quan tri."
            );
        }

        authManager.authenticate(new UsernamePasswordAuthenticationToken(username, request.password()));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessRuleException("Khong tim thay user sau khi xac thuc"));

        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.createRefreshCookie(refreshToken.getToken()).toString())
                .body(Map.of(
                        "message", "Login successful",
                        "userId", String.valueOf(user.getId()),
                        "username", user.getUsername(),
                        "accessToken", accessToken,
                        "tokenType", "Bearer"
                ));
    }

    @PostMapping({"/refresh", "/refresh/"})
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request) {
        String rawRefresh = readCookie(request, refreshTokenCookieService.refreshCookieName());

        RefreshToken rotated = refreshTokenService.verifyAndRotate(rawRefresh);
        User user = rotated.getUser();

        String newAccessToken = jwtService.generateAccessToken(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.createRefreshCookie(rotated.getToken()).toString())
                .body(Map.of(
                        "message", "Token refreshed successfully",
                        "accessToken", newAccessToken,
                        "tokenType", "Bearer"
                ));
    }

    @PostMapping({"/logout", "/logout/"})
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String rawRefresh = readCookie(request, refreshTokenCookieService.refreshCookieName());
        refreshTokenService.revokeSessionAndBump(rawRefresh);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.clearRefreshCookie().toString())
                .build();
    }

    private boolean isBcryptHash(String password) {
        return password != null && password.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$");
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
