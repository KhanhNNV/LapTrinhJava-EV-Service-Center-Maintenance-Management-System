package edu.uth.evservice.requests.jwt;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyEmailRequest {

    @NotBlank(message = "Token không được để trống")
    private String token;
}
