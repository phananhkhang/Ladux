package org.akira.auratech.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

        // 1. Lấy cái Header mang tên Authorization từ Request gửi lên
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 2. Chốt chặn 1: Nếu Header trống hoặc không bắt đầu bằng chữ "Bearer ", cho qua trạm gác này luôn vì nó khách vãng lai
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Cho phép request đi tiếp sang các filter sau
            return; // Thoát khỏi hàm hiện tại
        }

        // 3. Bốc tách chuỗi Token (Cắt bỏ chữ "Bearer " lấy phần mã phía sau)
        jwt = authHeader.substring(7);

        // 4. Dùng JwtService để bốc cái Username ra khỏi Token
        try {
            username = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException ex) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // 5. Nếu bốc được Username và hệ thống chưa xác thực cho request này (Authentication == null)
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) { // Ồ thấy người rồi, nhưng mà cháu đã được đóng dấu chưa, chưa thì bác đóng dấu cho nè

            // Vào DB tìm thông tin User thông qua UserDetailsService
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 6. Kiểm tra xem Token còn hạn và khớp thông tin với User dưới DB không
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Tạo một cái "Thẻ thông hành" hợp lệ chứa thông tin và quyền hạn (Roles) của User
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                // Đính kèm thêm chi tiết request (IP, Session ID...) vào thẻ
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 🚀 CHỐT HẠ: Nạp cái thẻ này vào Hệ thống Security của Spring.
                // Từ dòng này trở đi, các Filter sau và Controller sẽ công nhận User này đã ĐĂNG NHẬP THÀNH CÔNG!
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 7. Cuối cùng, dù Token đúng hay sai, vẫn phải gọi dòng này để đẩy request đi tiếp vào Controller nghiệp vụ
        filterChain.doFilter(request, response);
    }
}
