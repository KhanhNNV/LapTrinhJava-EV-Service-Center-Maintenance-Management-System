package edu.uth.evservice.requests.jwt;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String refreshToken;
}
