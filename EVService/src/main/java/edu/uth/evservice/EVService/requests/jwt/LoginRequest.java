package edu.uth.evservice.EVService.requests.jwt;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;    
    private String password; 
}