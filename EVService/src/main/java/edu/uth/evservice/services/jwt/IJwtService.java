package edu.uth.evservice.services.jwt;

import java.text.ParseException;

import org.springframework.security.core.Authentication;

import com.nimbusds.jose.JOSEException;

public interface IJwtService {
    //. Tạo một chuỗi AccessToken JWT
    String generateAccessToken(Authentication authenication);
    //. Tạo một chuỗi refeshToken
    String generateRefeshToken(Authentication authentication);
    //. Xác thực token
    boolean verifyToken(String token) throws ParseException, JOSEException;
}
