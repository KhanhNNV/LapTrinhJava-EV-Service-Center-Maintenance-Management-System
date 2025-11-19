package edu.uth.evservice.controllers.jwt;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.dtos.jwt.JwtDto;
import edu.uth.evservice.requests.ChangePasswordRequest;
import edu.uth.evservice.requests.jwt.ForgotPasswordRequest;
import edu.uth.evservice.requests.jwt.LoginRequest;
import edu.uth.evservice.requests.jwt.RefreshTokenRequest;
import edu.uth.evservice.requests.jwt.RegisterRequest;
import edu.uth.evservice.services.auth.IAuthenticaionService;
import edu.uth.evservice.requests.jwt.ResendVerificationRequest;
import edu.uth.evservice.requests.jwt.ResetPasswordRequest;
import edu.uth.evservice.requests.jwt.VerifyEmailRequest;
import jakarta.validation.Valid;
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
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            String message = authenticaionService.registerRequest(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", message));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // .API CẤP ACCESSTOKEN (autheToken)
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshUser(@RequestBody RefreshTokenRequest request) {
        JwtDto newAccessToken = authenticaionService.refreshToken(request);
        return ResponseEntity.ok(newAccessToken);
    }

    // ==============================================================
    // XÁC THỰC EMAIL (từ link trong email)
    // FE: POST /auth/verify-email { token }
    // ==============================================================


    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authenticaionService.verifyEmail(request.getToken());
        return ResponseEntity.ok(
                Map.of("message", "Xác thực email thành công. Bạn có thể đăng nhập."));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        try {
            String message = authenticaionService.resendVerificationEmail(request);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==============================================================
    // QUÊN MẬT KHẨU – gửi email reset
    // FE: POST /auth/forgot-password { email }
    // Luôn trả 200 (kể cả email không tồn tại) để tránh lộ thông tin
    // ==============================================================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authenticaionService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(
                Map.of("message", "Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu."));
    }

    // ==============================================================
    // ĐẶT LẠI MẬT KHẨU
    // FE: POST /auth/reset-password { token, newPassword }
    // ==============================================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authenticaionService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(
                Map.of("message", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại."));
    }


    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        Integer userId = Integer.parseInt(authentication.getName());
        authenticaionService.changePassword(userId, request);
        
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
