package org.akira.auratech.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

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