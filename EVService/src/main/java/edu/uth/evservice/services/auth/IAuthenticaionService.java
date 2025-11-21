package edu.uth.evservice.services.auth;

import edu.uth.evservice.dtos.jwt.JwtDto;
import edu.uth.evservice.requests.ChangePasswordRequest;
import edu.uth.evservice.requests.jwt.LoginRequest;
import edu.uth.evservice.requests.jwt.RefreshTokenRequest;
import edu.uth.evservice.requests.jwt.RegisterRequest;
import edu.uth.evservice.requests.jwt.ResendVerificationRequest;

public interface IAuthenticaionService {
    public JwtDto loginRequest(LoginRequest loginRequest);

    // public UserDto registerRequest(RegisterRequest registerRequest);
    String registerRequest(RegisterRequest request);

    public JwtDto refreshToken(RefreshTokenRequest refeshTokenRequest);

    // NEW: xác thực email
    void verifyEmail(String token);

    String resendVerificationEmail(ResendVerificationRequest request);

    // NEW: gửi mail quên mật khẩu (nếu email tồn tại)
    void forgotPassword(String email);
    // String sendPasswordResetEmail(String email);

    // NEW: đặt lại mật khẩu bằng token
    void resetPassword(String token, String newPassword);


    //Đổi mật khẩu ở setting
    void changePassword(Integer userId, ChangePasswordRequest request);
}
