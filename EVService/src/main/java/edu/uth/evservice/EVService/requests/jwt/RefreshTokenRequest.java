package edu.uth.evservice.EVService.requests.jwt;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String refreshToken;
}
