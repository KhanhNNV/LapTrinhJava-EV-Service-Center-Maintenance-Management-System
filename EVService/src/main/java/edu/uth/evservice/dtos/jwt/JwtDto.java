package edu.uth.evservice.dtos.jwt;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtDto {
    private String accessToken;//~Access Token (dùng để gọi API)
    private String type = "Bearer"; //~Loại token
    private String refreshToken; //~Refresh Token (dùng để lấy Access Token mới)

    //~Constructor này mục đích tiện để debug
    public JwtDto(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
