package org.akira.ladux.controller.admin;

import java.util.Map;

import org.akira.ladux.dto.user.request.LoginRequest;
import org.akira.ladux.dto.user.response.UserResponse;
import org.akira.ladux.exception.BusinessRuleException;
import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;
import org.akira.ladux.model.enums.RoleName;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.AuthCookieService;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.RefreshTokenService;
import org.akira.ladux.service.UserService;
import org.akira.ladux.utils.SecurityUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Phien xac thuc rieng cho admin. Cookie duoc dat ten/path khac storefront de
 * hai tai khoan co the hoat dong dong thoi tren hai tab cung origin.
 */
@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final UserService userService;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final AuthCookieService authCookieService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @PostMapping({"/login", "/login/"})
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        String username = request.username().trim();
        User existing = userRepository.findByUsername(username).orElse(null);
        if (existing != null && !isBcryptHash(existing.getPassword())) {
            throw new BusinessRuleException(
                    "Username '" + username + "' la user seed khong co mat khau dang nhap hop le. "
                            + "Hay cap nhat password BCrypt tu cong cu quan tri."
            );
        }

        authManager.authenticate(new UsernamePasswordAuthenticationToken(username, request.password()));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessRuleException("Khong tim thay user sau khi xac thuc"));
        requireAdmin(user);

        String accessToken = jwtService.generateAccessToken(user);
        RefreshToken refreshToken = refreshTokenService.create(user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAdminAccessCookie(accessToken).toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAdminRefreshCookie(refreshToken.getToken()).toString())
                .body(Map.of(
                        "message", "Admin login successful",
                        "userId", String.valueOf(user.getId()),
                        "username", user.getUsername()
                ));
    }

    @PostMapping({"/refresh", "/refresh/"})
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request) {
        String rawRefresh = readCookie(request, authCookieService.adminRefreshCookieName());
        RefreshToken rotated = refreshTokenService.verifyAndRotate(rawRefresh);
        User user = rotated.getUser();
        requireAdmin(user);

        String newAccessToken = jwtService.generateAccessToken(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAdminAccessCookie(newAccessToken).toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAdminRefreshCookie(rotated.getToken()).toString())
                .body(Map.of("message", "Admin token refreshed successfully"));
    }

    @PostMapping({"/logout", "/logout/"})
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String rawRefresh = readCookie(request, authCookieService.adminRefreshCookieName());
        refreshTokenService.revokeSessionAndBump(rawRefresh);

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authCookieService.clearAdminAccessCookie().toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.clearAdminRefreshCookie().toString())
                .build();
    }

    @GetMapping({"/me", "/me/"})
    public ResponseEntity<UserResponse> currentUser() {
        return ResponseEntity.ok(userService.getUserById(SecurityUtils.getCurrentUserId()));
    }

    private void requireAdmin(User user) {
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role.getName() == RoleName.ADMIN);
        if (!isAdmin) {
            throw new AccessDeniedException("Tai khoan khong co quyen quan tri");
        }
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
