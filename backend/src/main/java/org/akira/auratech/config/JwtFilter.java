package org.akira.auratech.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.akira.auratech.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String jwt = null;

        // 1. 🎯 THAY ĐỔI CỐT LÕI: Lội vào danh sách Cookie của Request để tìm cục AUTH_TOKEN
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("AUTH_TOKEN".equals(cookie.getName())) {
                    jwt = cookie.getValue(); // Bốc được chuỗi Token ra rồi!
                    break;
                }
            }
        }

        // 2. Chốt chặn 1: Nếu không tìm thấy Cookie chứa Token, cho qua làm khách vãng lai (Ẩn danh)
        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String username;

        // 3. Dùng JwtService để bốc cái Username (ở đây là Email) ra khỏi Token
        try {
            username = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException ex) {
            // Token hết hạn hoặc giả mạo -> Trả về 401 Unauthorized kèm Clear Cookie lỗi
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 4. Nếu bốc được Username và hệ thống chưa xác thực cho request này
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Vào DB tìm thông tin User thông qua UserDetailsService (Sẽ tìm bằng Email đồng bộ)
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 5. Kiểm tra tính hợp lệ của Token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Tạo thẻ thông hành hợp lệ
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 🚀 CHỐT HẠ: Nạp thẻ xác thực vào Spring Security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 6. Đẩy request đi tiếp vào Controller nghiệp vụ
        filterChain.doFilter(request, response);
    }
}