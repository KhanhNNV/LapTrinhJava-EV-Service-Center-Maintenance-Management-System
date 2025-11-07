package edu.uth.evservice.services.jwt;

import edu.uth.evservice.dtos.UserDto;
import edu.uth.evservice.dtos.jwt.JwtDto;
import edu.uth.evservice.requests.jwt.LoginRequest;
import edu.uth.evservice.requests.jwt.RefreshTokenRequest;
import edu.uth.evservice.requests.jwt.RegisterRequest;

public interface IAuthenticaionService {
    public JwtDto loginRequest (LoginRequest loginRequest);
    public UserDto registerRequest(RegisterRequest registerRequest); 
    public JwtDto refreshToken (RefreshTokenRequest refeshTokenRequest);
} 
