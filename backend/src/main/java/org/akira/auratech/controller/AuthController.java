package org.akira.auratech.controller;

import java.util.Map;

import org.akira.auratech.dto.request.LoginRequest;
import org.akira.auratech.dto.request.RegisterRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.akira.auratech.exception.BusinessRuleException;
import org.akira.auratech.model.RefreshToken;
import org.akira.auratech.model.User;
import org.akira.auratech.repository.UserRepository;
import org.akira.auratech.service.AuthCookieService;
import org.akira.auratech.service.JwtService;
import org.akira.auratech.service.RefreshTokenService;
import org.akira.auratech.service.UserService;
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

        // Xac thuc thanh cong -> user chac chan ton tai (kem roles do @EntityGraph).
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessRuleException("Khong tim thay user sau khi xac thuc"));

        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAccessCookie(accessToken).toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.createRefreshCookie(refreshToken.getToken()).toString())
                .body(Map.of(
                        "message", "Login successful",
                        "accessToken", accessToken
                ));
    }

    @PostMapping({"/refresh", "/refresh/"})
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request) {
        String rawRefresh = readCookie(request, authCookieService.refreshCookieName());

        // Xac thuc + xoay vong: token cu bi revoke, phat hanh token moi (chong replay).
        RefreshToken rotated = refreshTokenService.verifyAndRotate(rawRefresh);
        User user = rotated.getUser();

        String newAccessToken = jwtService.generateAccessToken(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAccessCookie(newAccessToken).toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.createRefreshCookie(rotated.getToken()).toString())
                .body(Map.of(
                        "message", "Token refreshed",
                        "accessToken", newAccessToken
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
