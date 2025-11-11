package edu.uth.evservice.controllers.jwt;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import edu.uth.evservice.dtos.UserDto;
import edu.uth.evservice.dtos.jwt.JwtDto;
import edu.uth.evservice.requests.jwt.LoginRequest;
import edu.uth.evservice.requests.jwt.RefreshTokenRequest;
import edu.uth.evservice.requests.jwt.RegisterRequest;
import edu.uth.evservice.services.jwt.IAuthenticaionService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor

public class AuthController {
    private final IAuthenticaionService authenticaionService;

    // . API ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest login) {
        JwtDto tokens = authenticaionService.loginRequest(login);
        return ResponseEntity.ok(tokens);
    };

    // . API ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest register) {
        UserDto created = authenticaionService.registerRequest(register);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // .API CẤP ACCESSTOKEN (autheToken)
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshUser(@RequestBody RefreshTokenRequest request) {
        JwtDto newAccessToken = authenticaionService.refreshToken(request);
        return ResponseEntity.ok(newAccessToken);
    }
}
