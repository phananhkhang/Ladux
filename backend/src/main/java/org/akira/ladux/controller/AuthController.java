package org.akira.ladux.controller;

import java.util.Map;

import org.akira.ladux.dto.user.request.LoginRequest;
import org.akira.ladux.dto.user.request.RegisterRequest;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.AuthCookieService;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.RefreshTokenService;
import org.akira.ladux.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// API xac thuc — dang ky, dang nhap, refresh token, logout, CSRF.
// Hai token: access JWT 15 phut (cookie AUTH_TOKEN), refresh opaque 7 ngay (cookie REFRESH_TOKEN, path /api/v1/auth).
// Logout: revoke refresh token + tang tokenVersion -> access token cu chet tuc thi.
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final AuthCookieService authCookieService;
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

        // Body KHÔNG TRẢ accessToken nữa!
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAccessCookie(accessToken).toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.createRefreshCookie(refreshToken.getToken()).toString())
                .body(Map.of(
                        "message", "Login successful",
                        "userId", String.valueOf(user.getId()),
                        "username", user.getUsername()
                ));
    }

    @PostMapping({"/refresh", "/refresh/"})
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request) {
        String rawRefresh = readCookie(request, authCookieService.refreshCookieName());

        RefreshToken rotated = refreshTokenService.verifyAndRotate(rawRefresh);
        User user = rotated.getUser();

        String newAccessToken = jwtService.generateAccessToken(user);

        // 🟢 BẢO MẬT: Đặt access token mới vào Cookie, Body chỉ báo OK
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAccessCookie(newAccessToken).toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.createRefreshCookie(rotated.getToken()).toString())
                .body(Map.of(
                        "message", "Token refreshed successfully"
                ));
    }

    @PostMapping({"/logout", "/logout/"})
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String rawRefresh = readCookie(request, authCookieService.refreshCookieName());
        refreshTokenService.revokeSessionAndBump(rawRefresh);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authCookieService.clearAccessCookie().toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.clearRefreshCookie().toString())
                .build();
    }

    @GetMapping("/csrf") // lay CSRF token de frontend gui kem header X-XSRF-TOKEN
    public ResponseEntity<Map<String, String>> csrf(CsrfToken csrfToken) {
        return ResponseEntity.ok(Map.of(
                "headerName", csrfToken.getHeaderName(),
                "parameterName", csrfToken.getParameterName(),
                "token", csrfToken.getToken()
        ));
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
