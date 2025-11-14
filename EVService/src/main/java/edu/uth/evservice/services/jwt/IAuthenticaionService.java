package edu.uth.evservice.services.jwt;

import edu.uth.evservice.dtos.UserDto;
import edu.uth.evservice.dtos.jwt.JwtDto;
import edu.uth.evservice.requests.jwt.LoginRequest;
import edu.uth.evservice.requests.jwt.RefreshTokenRequest;
import edu.uth.evservice.requests.jwt.RegisterRequest;
import edu.uth.evservice.requests.jwt.ForgotPasswordRequest;

public interface IAuthenticaionService {
    public JwtDto loginRequest(LoginRequest loginRequest);

    public UserDto registerRequest(RegisterRequest registerRequest);

    public JwtDto refreshToken(RefreshTokenRequest refeshTokenRequest);

    // ĐĂNG KÝ
    void sendRegistrationLink(RegisterRequest registerRequest);

    JwtDto verifyRegistrationAndLogin(String token);
    // QUÊN MẬT KHẨU
    void sendPasswordResetLink(ForgotPasswordRequest request);
    JwtDto verifyPasswordResetAndLogin(String token);
}

