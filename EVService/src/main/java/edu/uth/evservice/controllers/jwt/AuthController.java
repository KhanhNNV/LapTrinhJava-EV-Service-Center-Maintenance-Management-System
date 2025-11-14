package edu.uth.evservice.controllers.jwt;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.dtos.UserDto;
import edu.uth.evservice.dtos.jwt.JwtDto;
import edu.uth.evservice.requests.jwt.ForgotPasswordRequest;
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
    // @PostMapping("/register")
    // public ResponseEntity<?> registerUser(@RequestBody RegisterRequest register)
    // {
    // UserDto created = authenticaionService.registerRequest(register);
    // return ResponseEntity.status(HttpStatus.CREATED).body(created);
    // }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest register) {
        // Gọi hàm mới: gửi link xác thực
        authenticaionService.sendRegistrationLink(register);

        return ResponseEntity.ok(
                "Một email xác thực đã được gửi đến " + register.getEmail() + ". Vui lòng kiểm tra hộp thư.");
    }

    // API để xác thực link (// ==== ĐĂNG KÝ === ///)
    @GetMapping("/verify-registration")
    public ResponseEntity<?> verifyRegistration(@RequestParam("token") String token) {
        // Hàm này sẽ xác thực token, tạo user, và trả về token đăng nhập
        JwtDto jwtDto = authenticaionService.verifyRegistrationAndLogin(token);

        // Trả về token để FE tự động đăng nhập
        return ResponseEntity.ok(jwtDto);
    }

    // API xác thực link và đăng nhập ( // === QUÊN MẬT KHẨU ====///)
    @GetMapping("/verify-password-reset")
    public ResponseEntity<?> verifyPasswordReset(@RequestParam("token") String token) {
        JwtDto jwtDto = authenticaionService.verifyPasswordResetAndLogin(token);
        return ResponseEntity.ok(jwtDto);
    }

    // .API CẤP ACCESSTOKEN (autheToken)
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshUser(@RequestBody RefreshTokenRequest request) {
        JwtDto newAccessToken = authenticaionService.refreshToken(request);
        return ResponseEntity.ok(newAccessToken);
    }
    //. API YÊU CẦU QUÊN MẬT KHẨU
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authenticaionService.sendPasswordResetLink(request);
        return ResponseEntity.ok("Nếu email tồn tại, một link đặt lại mật khẩu đã được gửi.");
    }
}
