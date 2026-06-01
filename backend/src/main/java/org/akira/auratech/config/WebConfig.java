package org.akira.auratech.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.config.PageableHandlerMethodArgumentResolverCustomizer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.filter.UrlHandlerFilter;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public FilterRegistrationBean<UrlHandlerFilter> trailingSlashHandlerFilter() {
        UrlHandlerFilter filter = UrlHandlerFilter
                .trailingSlashHandler("/**")
                .wrapRequest()
                .build();
        FilterRegistrationBean<UrlHandlerFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
    @Bean
    public PageableHandlerMethodArgumentResolverCustomizer customizePageable() {
        return resolver -> {
            // Nếu client không truyền size, mặc định chỉ lấy 12 sản phẩm
            resolver.setFallbackPageable(PageRequest.of(0, 12));

            // CHỐT CHẶN TỬ HUYỆT: Dù client truyền size to thế nào, tối đa cũng chỉ được lấy 50 dòng!
            resolver.setMaxPageSize(50);
        };
    }
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho TẤT CẢ các đường dẫn API trong hệ thống
                .allowedOrigins("http://localhost:3000") // Chỉ cho phép duy nhất ông thần React này gọi vào
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các lệnh được phép dùng
                .allowedHeaders("*") // Chấp nhận mọi loại định dạng Header truyền lên
                .allowCredentials(true) // Cho phép truyền Cookie / Token kèm theo nếu sau này cần
                .maxAge(3600); // Lưu cấu hình này vào cache trình duyệt trong 1 tiếng để tăng tốc độ
    }
}
