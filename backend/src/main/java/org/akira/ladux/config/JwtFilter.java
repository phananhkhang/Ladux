package org.akira.ladux.config;

import java.io.IOException;

import org.akira.ladux.model.UserPrincipal;
import org.akira.ladux.service.AuthCookieService;
import org.akira.ladux.service.JwtService;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// Filter xac thuc JWT tren moi HTTP request (chay truoc UsernamePasswordAuthenticationFilter).
// Luong: doc token tu cookie AUTH_TOKEN hoac header Bearer -> parse JWT -> load UserDetails
// -> kiem tra user active, token con han, tokenVersion khop DB -> nap Authentication vao SecurityContext.
// Token khong hop le: xoa cookie (neu co) va tiep tuc chain nhu anonymous — KHONG tra 401 o day.
// Endpoint public (catalog GET) van phai hoat dong; endpoint can auth se bi Spring Security chan.
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AuthCookieService authCookieService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String cookieJwt = readJwtFromCookie(request);
        String jwt = cookieJwt != null ? cookieJwt : readJwtFromAuthorizationHeader(request);
        boolean fromCookie = cookieJwt != null;

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String username;

        // 3. Dùng JwtService để bốc cái Username (ở đây là Email) ra khỏi Token
        try {
            username = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException ex) {
            // Token het han / sai chu ky / malform — bo qua auth, giu request public.
            clearInvalidToken(request, response, fromCookie);
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Nếu bốc được Username và hệ thống chưa xác thực cho request này
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails;
            try {
                userDetails = this.userDetailsService.loadUserByUsername(username);
            } catch (UsernameNotFoundException ex) {
                clearInvalidToken(request, response, fromCookie);
                filterChain.doFilter(request, response);
                return;
            }

            // (A) User bi khoa / vo hieu hoa — khong dung token do, van cho xem catalog public.
            if (!userDetails.isEnabled()) {
                clearInvalidToken(request, response, fromCookie);
                filterChain.doFilter(request, response);
                return;
            }

            // 5. Kiểm tra tính hợp lệ của Token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // (B) So khop tokenVersion: sau logout / doi mat khau / khoa tai khoan,
                // tokenVersion cua user da tang -> access token cu bi bo qua.
                Integer tokenVersion = jwtService.extractTokenVersion(jwt);
                int currentVersion = (userDetails instanceof UserPrincipal up) ? up.getTokenVersion() : -1;
                if (tokenVersion == null || tokenVersion != currentVersion) {
                    clearInvalidToken(request, response, fromCookie);
                    filterChain.doFilter(request, response);
                    return;
                }

                // Tạo thẻ thông hành hợp lệ
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 🚀 CHỐT HẠ: Nạp thẻ xác thực vào Spring Security context
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else if (fromCookie) {
                // Token cookie het han / khong hop le — xoa de lan sau khong gui lai.
                clearInvalidToken(request, response, true);
            }
        }

        // 6. Đẩy request đi tiếp vào Controller nghiệp vụ
        filterChain.doFilter(request, response);
    }

    /** Xoa SecurityContext + cookie access (neu co). Khong set status 401 — de authorization quyet dinh. */
    private void clearInvalidToken(HttpServletRequest request, HttpServletResponse response, boolean fromCookie) {
        SecurityContextHolder.clearContext();
        if (fromCookie) {
            response.addHeader(
                    HttpHeaders.SET_COOKIE,
                    (isAdminRequest(request)
                            ? authCookieService.clearAdminAccessCookie()
                            : authCookieService.clearAccessCookie()).toString()
            );
        }
    }

    private String readJwtFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        String cookieName = isAdminRequest(request)
                ? authCookieService.adminAccessCookieName()
                : authCookieService.accessCookieName();
        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private boolean isAdminRequest(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return path.equals("/api/v1/admin") || path.startsWith("/api/v1/admin/");
    }

    private String readJwtFromAuthorizationHeader(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return null;
        }
        String token = authHeader.substring(7).trim();
        return token.isEmpty() ? null : token;
    }
}

