package edu.uth.evservice.config;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Objects;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.nimbusds.jose.JOSEException;

import edu.uth.evservice.services.jwt.IJwtService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtDecoderConfig implements JwtDecoder{
    private final IJwtService jwtService;
    private NimbusJwtDecoder nimbusJwtDecoder = null;

    //.Lấy từ thằng resources/application.properties
    @Value("${app.key.secret}")
    private String keySecret;

    @Override
    public Jwt decode(String token) throws JwtException {
        try{
            //~Kiểm tra token xác thực hợp lệ không
            if(!jwtService.verifyToken(token)){
                throw new RuntimeException("Invalid token");
            }
            //~Khởi tạo NimbusJwtDecoder nếu chưa có
            if(Objects.isNull(nimbusJwtDecoder)){
                //~Khởi tạo khóa bí mật để xác thực token
                SecretKey sercetKeySpec = new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HS512");
                nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(sercetKeySpec)
                        .macAlgorithm(MacAlgorithm.HS512)
                        .build();
            }
        } catch (ParseException |JOSEException e) {
            throw new RuntimeException(e);
        }
        return nimbusJwtDecoder.decode(token);
    }
}
