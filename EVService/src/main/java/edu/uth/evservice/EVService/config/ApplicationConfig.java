package edu.uth.evservice.EVService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
// . Mục đích là để ngăn chặng vòng lặp khi khởi tạo Contructors
// . SecurityConfig -> CustomOauth2UserService -> UserServiceImpl->
//. PasswordEncoder(lại nằm ở trong thằng SecurityConfig)
@Configuration
public class ApplicationConfig {
    // . Mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
