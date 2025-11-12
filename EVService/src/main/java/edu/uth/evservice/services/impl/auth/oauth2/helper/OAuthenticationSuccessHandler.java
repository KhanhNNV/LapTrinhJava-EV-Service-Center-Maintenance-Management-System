package edu.uth.evservice.services.impl.auth.oauth2.helper;

import java.io.IOException;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import edu.uth.evservice.services.auth.IJwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component

//. Hander này sẽ được gọi sau khi CustomOAuth2UserService chạy thành công và trả về một CustomerUserDetails
//~ Nhiệm vụ handler này là tạo ra JWT và chuyển người dùng về phía client
public class OAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler{
    private final IJwtService jwtService;


    @Value("${app.oauth2.redirect-uri}")
    private String url;



    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            org.springframework.security.core.Authentication authentication) throws IOException, ServletException {
        
        //~ Tạo accessToken
        String accessToken = jwtService.generateAccessToken(authentication);
        String refreshToken = jwtService.generateRefreshToken(authentication);
        //~Xây dựng URL để đưa user về phía người dùng
        String targetUrl = UriComponentsBuilder.fromUriString(url)
                .queryParam("authToken", accessToken) // Gắn token vào làm query param "token"
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();
        //~ Xóa session tạm thời
        clearAuthenticationAttributes(request);
        //~ Chuyển hướng người dùng về phía client
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    
    
    
}
