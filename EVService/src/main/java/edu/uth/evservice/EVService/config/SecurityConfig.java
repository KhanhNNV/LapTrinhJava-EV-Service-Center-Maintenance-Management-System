//package edu.uth.evservice.EVService.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//@Configuration
//public class SecurityConfig {
//
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//}
package edu.uth.evservice.EVService.config; // Đảm bảo tên package này khớp với cấu trúc thư mục của bạn

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Tắt tính năng CSRF (rất quan trọng khi làm việc với Postman)
                .csrf(csrf -> csrf.disable())
                // Cấu hình để cho phép TẤT CẢ các yêu cầu đi qua mà không cần mật khẩu
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // .permitAll() có nghĩa là cho phép tất cả
                );
        return http.build();
    }
}