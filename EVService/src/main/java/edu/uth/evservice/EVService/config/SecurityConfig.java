package edu.uth.evservice.EVService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import static edu.uth.evservice.EVService.model.enums.Role.CUSTOMER;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtDecoderConfig jwtDecoderConfig;

    // . Mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // . Đây là interface của Spring mục đích là để xác thực thông tin đăng nhập
    // .
    @Bean
    public AuthenticationManager authorizationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    // .Cấu hình bảo mật chính cho toàn bộ hệ thống backend
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ~Vì dự án dùng JWT, nên không cần dùng CSRF
                // ~ CSRF là cơ chế xác thực dự trên cookie/session
                .csrf(AbstractHttpConfigurer::disable)

                // ~ Định nghĩa các quy tắc cho các request
                .authorizeHttpRequests(authorize -> authorize

                        // - Cho phép tất cả request auth đều có thể truy cập bỏi bất cứ ai
                        .requestMatchers("/auth/**").permitAll()
                        // Yêu cầu mọi request đến "/api/v1/vehicles/**" phải có JWT token chứa role là
                        // "CUSTOMER".
                        .requestMatchers("/api/v1/vehicles/**").hasRole(CUSTOMER.name())
                        // ~ Tất cả các request khác đều yêu cầu phải xác thực JWT
                        .anyRequest().authenticated()

                )
                // ~ Dùng chuẩn JWT để kiểm tra vé (Token)
                // ~ Cấu hình ở file JWT Decode
                // .oauth2ResourceServer((oauth2) -> oauth2.jwt(JwtConfigurer ->
                // JwtConfigurer.decoder(jwtDecoderConfig)))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoderConfig)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())))
                // ~Vì dùng JWT nên việt lưu session ở phía server là không cần thiết
                // ~Chế độ STATELESS (Không trạng thái)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthoritiesClaimName("role"); // trùng với key trong token
        converter.setAuthorityPrefix(""); // token đã có "ROLE_" rồi

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
        return jwtConverter;
    }

}
