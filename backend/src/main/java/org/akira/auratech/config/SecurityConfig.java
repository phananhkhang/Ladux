package org.akira.auratech.config;

import java.time.LocalDateTime;
import java.util.List;

import org.akira.auratech.exception.ErrorResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.InvalidCsrfTokenException;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

// Cau hinh bao mat toan he thong — stateless, JWT cookie, CSRF, CORS, OAuth2 Google.
// Phan quyen URL: public (auth, catalog GET, webhook VNPay, Swagger, actuator health/info),
// ADMIN (actuator con lai), con lai yeu cau dang nhap.
// Luong OAuth2: User -> Google Login -> OAuth2SuccessHandler -> JWT + Set-Cookie -> JwtFilter -> Controller.
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Request mang Bearer token duoc mien CSRF (token-based auth khong can CSRF).
    private static final RequestMatcher BEARER_AUTH_REQUEST = request -> {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        return authHeader != null && authHeader.regionMatches(true, 0, "Bearer ", 0, 7);
    };

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
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfTokenRepository.setCookiePath("/");

        CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();
        csrfRequestHandler.setCsrfRequestAttributeName(null);

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfTokenRepository)
                        .csrfTokenRequestHandler(csrfRequestHandler)
                        .ignoringRequestMatchers(
                                "/api/v1/auth/login", "/api/v1/auth/login/",
                                "/api/v1/auth/register", "/api/v1/auth/register/",
                                "/api/v1/auth/refresh", "/api/v1/auth/refresh/",
                                "/api/v1/auth/logout", "/api/v1/auth/logout/",
                                "/api/v1/payments/vnpay-webhook",
                                "/oauth2/**", "/login/oauth2/**"
                        )
                        .ignoringRequestMatchers(BEARER_AUTH_REQUEST)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/v1/payments/vnpay-webhook").permitAll()
                        .requestMatchers("/error", "/api/v1/auth/**", "/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/products/**",
                                "/api/v1/brands/**",
                                "/api/v1/categories/**",
                                "/api/v1/reviews/**")
                        .permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/actuator/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2SuccessHandler)
                )
                .exceptionHandling(exceptions -> exceptions.accessDeniedHandler((request, response, ex) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    String message = ex instanceof InvalidCsrfTokenException
                            ? "CSRF token khong hop le. Hay goi GET /api/v1/auth/csrf, bat Postman gui cookies, "
                            + "roi gui header X-XSRF-TOKEN (gia tri trung voi cookie XSRF-TOKEN)."
                            : "Ban khong co quyen thuc hien thao tac nay";
                    ErrorResponse body = ErrorResponse.builder()
                            .timestamp(LocalDateTime.now())
                            .status(HttpServletResponse.SC_FORBIDDEN)
                            .error("Forbidden")
                            .message(message)
                            .build();
                    new ObjectMapper().writeValue(response.getOutputStream(), body);
                }));

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "https://auratech.vn"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control", "Cookie", "X-XSRF-TOKEN"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
