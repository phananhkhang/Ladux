package org.akira.auratech.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.dto.request.LoginRequest;
import org.akira.auratech.dto.request.RegisterRequest;
import org.akira.auratech.dto.response.UserResponse;
import org.akira.auratech.service.AuthCookieService;
import org.akira.auratech.service.JwtService;
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

import java.util.Map;
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final AuthCookieService authCookieService;

    @PostMapping({"/register", "/register/"})
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(userService.savedUser(request), HttpStatus.CREATED);
    }

    @PostMapping({"/login", "/login/"})
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        String token = jwtService.generateToken(request.username());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAuthCookie(token).toString())
                .body(Map.of("message", "Login successful"));
    }

    @PostMapping({"/logout", "/logout/"})
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authCookieService.clearAuthCookie().toString())
                .build();
    }

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(CsrfToken csrfToken) {
        return ResponseEntity.ok(Map.of(
                "headerName", csrfToken.getHeaderName(),
                "parameterName", csrfToken.getParameterName(),
                "token", csrfToken.getToken()
        ));
    }
}
