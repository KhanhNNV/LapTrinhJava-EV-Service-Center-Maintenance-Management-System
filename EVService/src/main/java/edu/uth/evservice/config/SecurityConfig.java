package edu.uth.evservice.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import edu.uth.evservice.services.impl.auth.oauth2.CustomOAuth2UserService;
import edu.uth.evservice.services.impl.auth.oauth2.CustomOidcUserService;
import edu.uth.evservice.services.impl.auth.oauth2.helpers.OAuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtDecoderConfig jwtDecoderConfig;
    private final OAuthenticationSuccessHandler oAuthenticationSuccessHandler;
    private final CustomOAuth2UserService customOauth2UserService;
    private final CustomOidcUserService customOidcUserService;

    // . Đây là interface của Spring mục đích là để xác thực thông tin đăng nhập
    // .
    @Bean
    public AuthenticationManager authorizationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // . Cơ chế COR(Cross-Origin Resource Sharing)
    // ~ Giải thích: Với nguyên tắc của ALL trình duyệt, chỉ cung câp cùng nguồn:
    // ~ origin = protocol + domain + port
    // ~ vì chúng server port 8081 còn client port 5173 => != port
    // ~ cách khắc phục viết hàm CORS:
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // ~ Cho phép danh sách các đường dẫn nào truy cập ở đây chỉ có 1 là FE với port
        // 5173
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // ~ Cho phép các phương thức được sử dụng
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        // ~ Cho phép các header mà FE gửi kèm
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        // ~ Cho phép trình duyệt gửi kèm thông tin xác thực (credentials) như cookie
        // hoặc JWT header trong request
        configuration.setAllowCredentials(true);

        // ~ Đăng ký config trên cho toàn bộ API
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    // .Cấu hình bảo mật chính cho toàn bộ hệ thống backend
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ~Thêm cấu hình CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ~Vì dự án dùng JWT, nên không cần dùng CSRF
                // ~ CSRF là cơ chế xác thực dự trên cookie/session
                .csrf(AbstractHttpConfigurer::disable)

                // ~ Định nghĩa các quy tắc cho các request
                .authorizeHttpRequests(authorize -> authorize

                        // - Cho phép tất cả request auth đều có thể truy cập bỏi bất cứ ai
                        // - Cho phép các cổng thanh toán gọi IPN và Return URLs
                        .requestMatchers("/auth/**", "/oauth2/**", "/login/oauth/code/**","/api/payments/vnpay-ipn", "/api/payments/vnpay-return").permitAll()

                        // ~ Tất cả các request khác đều yêu cầu phải xác thực JWT
                        .anyRequest().authenticated()

                )
                // ~ Dùng chuẩn JWT để kiểm tra vé (Token)
                // ~ Cấu hình ở file JWT Decode
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoderConfig)
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())))
                // ~Kích hoạt luồng OAuth2
                .oauth2Login(oauth2 -> oauth2
                        // ~Chỉ định service để tìm/tạo user
                        .userInfoEndpoint(userInfo -> userInfo
                                .oidcUserService(customOidcUserService) // <--Dùng cho Google
                                .userService(customOauth2UserService) // <-- Dùng cho Facebook, GitHub
                        )
                        // ~ Chỉ định handler để tạo JWT và redirect về React
                        .successHandler(oAuthenticationSuccessHandler))
                // ~Vì dùng JWT nên việc lưu session ở phía server là không cần thiết
                // ~Chế độ STATELESS (Không trạng thái) nhưng sử dụng login.register social nên
                // cũng cần sài tí thằng session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));
        return http.build();
    }

    /**
     * Chuyển JWT thành GrantedAuthority
     * GrantedAuthority đại diện cho một vai trò (role)
     * khi gọi api @PreAuthorize("hasRole('ADMIN')") sẽ dùng danh sách
     * GrantedAuthority để kiểm tra
     *
     */
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