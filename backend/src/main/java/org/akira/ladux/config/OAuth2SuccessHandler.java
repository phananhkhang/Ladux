package org.akira.ladux.config;

import java.io.IOException;

import org.akira.ladux.model.User;
import org.akira.ladux.repository.UserRepository;
import org.akira.ladux.service.AuthCookieService;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

//User
// ↓
//Login with Google
// ↓
//Google xác thực thành công
// ↓
//Spring Security nhận được thông tin user
// ↓
//OAuth2SuccessHandler chạy
// ↓
//Tạo JWT Token
// ↓
//Redirect về React kèm token

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final AuthCookieService authCookieService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;

    @Value("${app.oauth2.success-redirect:http://localhost:3000/checkout/success}")
    private String successRedirectUrl;

    public OAuth2SuccessHandler(
            JwtService jwtService,
            AuthCookieService authCookieService,
            RefreshTokenService refreshTokenService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.authCookieService = authCookieService;
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal(); // Lấy thông tin user từ google
        String email = oAuth2User.getAttribute("email"); // Lấy email từ Google trả về
        if (email == null || email.isBlank()) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth2 email is required");
            return;
        }

        User user = userRepository.findByCustomerEmail(email)
                .orElse(null);
        if (user == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "OAuth2 user is not registered");
            return;
        }
        if (!user.isActive()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "User account is disabled");
            return;
        }

        String accessToken = jwtService.generateAccessToken(user);
        org.akira.ladux.model.RefreshToken refreshToken = refreshTokenService.create(user);
        response.addHeader(HttpHeaders.SET_COOKIE, authCookieService.createAccessCookie(accessToken).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, authCookieService.createRefreshCookie(refreshToken.getToken()).toString());

        getRedirectStrategy().sendRedirect(request, response, successRedirectUrl);
    }
}
