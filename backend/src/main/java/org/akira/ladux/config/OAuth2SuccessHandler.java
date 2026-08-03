package org.akira.ladux.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.akira.ladux.model.RefreshToken;
import org.akira.ladux.model.User;
import org.akira.ladux.service.AuthCookieService;
import org.akira.ladux.service.GoogleOAuth2UserService;
import org.akira.ladux.service.JwtService;
import org.akira.ladux.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final AuthCookieService authCookieService;
    private final RefreshTokenService refreshTokenService;
    private final GoogleOAuth2UserService googleOAuth2UserService;
    private final OAuth2FailureHandler oAuth2FailureHandler;

    @Value("${app.oauth2.success-redirect}")
    private String successRedirectUrl;

    public OAuth2SuccessHandler(
            JwtService jwtService,
            AuthCookieService authCookieService,
            RefreshTokenService refreshTokenService,
            GoogleOAuth2UserService googleOAuth2UserService,
            OAuth2FailureHandler oAuth2FailureHandler
    ) {
        this.jwtService = jwtService;
        this.authCookieService = authCookieService;
        this.refreshTokenService = refreshTokenService;
        this.googleOAuth2UserService = googleOAuth2UserService;
        this.oAuth2FailureHandler = oAuth2FailureHandler;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        try {
            OAuth2User principal = (OAuth2User) authentication.getPrincipal();

            String googleSubject = principal.getAttribute("sub");
            String email = principal.getAttribute("email");
            String fullName = principal.getAttribute("name");
            String picture = principal.getAttribute("picture");

            Object verifiedAttribute = principal.getAttribute("email_verified");

            boolean emailVerified = Boolean.TRUE.equals(verifiedAttribute)
                    || "true".equalsIgnoreCase(String.valueOf(verifiedAttribute));

            User user = googleOAuth2UserService.loginOrRegister(
                    googleSubject,
                    email,
                    emailVerified,
                    fullName,
                    picture
            );

            String accessToken = jwtService.generateAccessToken(user);
            RefreshToken refreshToken = refreshTokenService.create(user);

            response.addHeader(
                    HttpHeaders.SET_COOKIE,
                    authCookieService.createAccessCookie(accessToken).toString()
            );

            response.addHeader(
                    HttpHeaders.SET_COOKIE,
                    authCookieService.createRefreshCookie(refreshToken.getToken()).toString()
            );

            clearAuthenticationAttributes(request);
            getRedirectStrategy().sendRedirect(request, response, successRedirectUrl);
        } catch (RuntimeException exception) {
            clearAuthenticationAttributes(request);
            oAuth2FailureHandler.onAuthenticationFailure(
                    request,
                    response,
                    new AuthenticationServiceException(
                            "Không thể hoàn tất đăng nhập Google",
                            exception
                    )
            );
        }
    }
}
