package edu.uth.evservice.services.jwt;

import java.text.ParseException;

import org.springframework.security.core.Authentication;

import com.nimbusds.jose.JOSEException;

import edu.uth.evservice.requests.jwt.RegisterRequest;

public interface IJwtService {
    //. Tạo một chuỗi AccessToken JWT
    String generateAccessToken(Authentication authenication);
    //. Tạo một chuỗi refeshToken
    String generateRefreshToken(Authentication authentication);
    //. Xác thực token
    boolean verifyToken(String token) throws ParseException, JOSEException;
    //. Lấy Subject
    String getSubject(String token) throws ParseException;
    //. Lấy claim
    Object getClaim(String token, String claimName) throws ParseException;

        // TẠO MỚI: Hàm tạo token đăng ký (thời hạn 15 phút)
    String generateRegistrationToken(RegisterRequest request);
    String generatePasswordResetToken(Authentication authenication);
}
