package edu.uth.evservice.EVService.services.jwt;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.dto.jwt.JwtDto;
import edu.uth.evservice.EVService.requests.jwt.LoginRequest;
import edu.uth.evservice.EVService.requests.jwt.RefreshTokenRequest;
import edu.uth.evservice.EVService.requests.jwt.RegisterRequest;

public interface IAuthenticaionService {
    public JwtDto loginRequest (LoginRequest loginRequest);
    public UserDto registerRequest(RegisterRequest registerRequest); 
    public JwtDto refreshToken (RefreshTokenRequest refeshTokenRequest);
} 
