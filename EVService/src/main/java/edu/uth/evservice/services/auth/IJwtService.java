package edu.uth.evservice.services.auth;

import java.text.ParseException;

import org.springframework.security.core.Authentication;

import com.nimbusds.jose.JOSEException;

import edu.uth.evservice.requests.jwt.RegisterRequest;

public interface IJwtService {
    // . Tạo một chuỗi AccessToken JWT
    String generateAccessToken(Authentication authenication);

    // . Tạo một chuỗi refeshToken
    String generateRefreshToken(Authentication authentication);

    // . Xác thực token
    boolean verifyToken(String token) throws ParseException, JOSEException;

    // . Lấy Subject
    String getSubject(String token) throws ParseException;

    // . Lấy claim
    Object getClaim(String token, String claimName) throws ParseException;

    // Tao token xac thuc email
    String generateVerificationToken(RegisterRequest request); // THÊM
}
