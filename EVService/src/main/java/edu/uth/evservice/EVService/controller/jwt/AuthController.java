package edu.uth.evservice.EVService.controller.jwt;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.dto.jwt.JwtDto;
import edu.uth.evservice.EVService.requests.jwt.LoginRequest;
import edu.uth.evservice.EVService.requests.jwt.RegisterRequest;
import edu.uth.evservice.EVService.services.jwt.IAuthenticaionService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor

public class AuthController {
    private final IAuthenticaionService authenticaionService;
    
    //. API ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser (@RequestBody LoginRequest login){
        JwtDto tokens =  authenticaionService.loginRequest(login);
        return ResponseEntity.ok(tokens);
    };

    //. API ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<?> registerUser (@RequestBody RegisterRequest register){
        UserDto created = authenticaionService.registerRequest(register);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
