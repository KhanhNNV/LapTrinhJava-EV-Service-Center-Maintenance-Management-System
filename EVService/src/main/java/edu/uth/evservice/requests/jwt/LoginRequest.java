package edu.uth.evservice.requests.jwt;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}