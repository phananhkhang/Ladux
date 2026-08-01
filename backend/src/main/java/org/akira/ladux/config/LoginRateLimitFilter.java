package org.akira.ladux.config;

import java.io.IOException;
import java.time.Duration;
import java.util.function.Supplier;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Rate limit cho endpoint dang nhap: gioi han so lan POST /api/v1/auth/login theo IP client.
 *
 * Chay som (HIGHEST_PRECEDENCE) de chan TRUOC khi ton tai nguyen xac thuc. Bucket duoc luu
 * tren Redis (qua ProxyManager) nen gioi han dung chung cho moi instance. Vuot nguong -> 429.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/v1/auth/login";
    private static final String TOO_MANY_REQUESTS_BODY =
            "{\"message\":\"Bạn đăng nhập quá nhiều, hãy thử lại sau!\"}";

    private final ProxyManager<String> proxyManager;
    private final int capacity;
    private final Duration refillPeriod;

    public LoginRateLimitFilter(
            ProxyManager<String> proxyManager,
            @Value("${app.rate-limit.login.capacity:5}") int capacity,
            @Value("${app.rate-limit.login.refill-minutes:1}") long refillMinutes) {
        this.proxyManager = proxyManager;
        this.capacity = capacity;
        this.refillPeriod = Duration.ofMinutes(refillMinutes);
    }

    /** Chi ap dung cho POST /api/v1/auth/login (ke ca co dau "/" cuoi). */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        boolean isLoginPost = "POST".equalsIgnoreCase(request.getMethod())
                && request.getRequestURI().startsWith(LOGIN_PATH);
        return !isLoginPost;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String key = "login-rate-limit:" + resolveClientIp(request);
        Bucket bucket = proxyManager.builder().build(key, bucketConfiguration());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Vuot gioi han -> tra 429 voi body JSON. (Servlet API khong co hang SC_429.)
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(refillPeriod.toSeconds()));
        response.getWriter().write(TOO_MANY_REQUESTS_BODY);
    }

    private Supplier<BucketConfiguration> bucketConfiguration() {
        return () -> BucketConfiguration.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(capacity)
                        .refillGreedy(capacity, refillPeriod)
                        .build())
                .build();
    }

    /** Lay IP that cua client; uu tien X-Forwarded-For khi chay sau proxy/load balancer. */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
