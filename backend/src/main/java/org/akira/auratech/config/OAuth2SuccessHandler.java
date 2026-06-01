package org.akira.auratech.config;

import org.akira.auratech.service.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import javax.swing.*;
import java.io.IOException;

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

    public OAuth2SuccessHandler(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal(); // Lấy thông tin user từ google
        String email = oAuth2User.getAttribute("email"); // Lấy email từ Google trả về

        String token = jwtService.generateToken(email);
        ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", token)
                .httpOnly(true)          // Code javascript (XSS) hoàn toàn bất lực không thể ăn trộm token
                .secure(true)            // Chỉ truyền qua giao thức mã hóa HTTPS bảo mật
                .path("/")               // Có hiệu lực trên toàn bộ domain hệ thống
                .maxAge(7 * 24 * 60 * 60)// Thời gian sống trong vòng 7 ngày
                .sameSite("Strict")      // Tấm khiên tối thượng triệt tiêu 100% đòn tấn công giả mạo CSRF
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Redirect sạch sẽ không tì vết, không rò rỉ token nhạy cảm ra Browser History hay Web Log
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:3000/checkout/success");
    }
}
