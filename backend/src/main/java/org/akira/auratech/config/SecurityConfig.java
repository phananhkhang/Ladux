package org.akira.auratech.config;

import com.nimbusds.jwt.JWT;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
// Trung tâm an ninh của auratech
@Configuration
@EnableWebSecurity // Bật spring security
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 🛡️ Tiêm bộ lọc cấu hình CORS chính chủ doanh nghiệp
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // API Stateless chạy bằng JWT Cookie có SameSite=Strict nên an tâm disable CSRF mặc định của Spring
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**", "/login/oauth2/**", "/api/v1/brands/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler)
                );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // ❌ TUYỆT ĐỐI CẤM dùng "*" trên Prod.
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://auratech.vn"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control", "Cookie"));
        // 🎯 BẮT BUỘC: Cho phép truyền nhận Cookie chứa JWT qua lại giữa Front-end và Back-end
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
// Luồng hoạt động
//        User
// ↓
//        Google Login
// ↓
//        OAuth2SuccessHandler
// ↓
//        JWT
// ↓
//        Set-Cookie(AUTH_TOKEN)
// ↓
//        Browser lưu Cookie
// ↓
//        React gọi API
// ↓
//        Cookie AUTH_TOKEN gửi kèm
// ↓
//        JwtFilter
// ↓
//        Validate JWT
// ↓
//        SecurityContext
// ↓
//        Controller
