package edu.uth.evservice.EVService.controller.jwt;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.dto.jwt.JwtDto;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.requests.jwt.LoginRequest;
import edu.uth.evservice.EVService.requests.jwt.RegisterRequest;
import edu.uth.evservice.EVService.services.IUserService;
import edu.uth.evservice.EVService.services.jwt.IJwtService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor

public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final IJwtService jwtService;
    private final IUserService userService;

    // . API ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest login) {
        // ~Tạo đối tượng UsernamePasswordAuthenticationToken từ email và password người
        // dùng gửi lên
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                login.getUsernameOrEmail(),
                login.getPassword());
        // ~ Thực hiện xác thực bằng AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(authToken);
        // ~ Này viết ra để kiểm tra lỗi
        Authentication authFromContext = SecurityContextHolder.getContext().getAuthentication();
        if (authFromContext != null && authFromContext.isAuthenticated()) {
            System.out.println("Người dùng '" + authFromContext.getName() + "' vừa đăng nhập thành công.");
        }
        // ~ Tạo accessToken và refeshToken
        String accessToken = jwtService.generateAccessToken(authentication);
        String refreshToken = jwtService.generateRefeshToken(authentication);
        // ~Trả 2 token về phía client
        return ResponseEntity.ok(new JwtDto(accessToken, refreshToken));
    };

    // . API ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest register) {
        // ~ Chuyển thằng registerRequest sang thằng createUserRequest
        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername(register.getUsername());
        createUserRequest.setFullName(register.getFullName());
        createUserRequest.setEmail(register.getEmail());
        createUserRequest.setPassword(register.getPassword());
        createUserRequest.setPhoneNumber(register.getPhoneNumber());
        createUserRequest.setAddress(register.getAddress());
        createUserRequest.setRole(Role.CUSTOMER.name());
        try {
            UserDto newUser = userService.createUser(createUserRequest);
            System.out.println("Đăng ký thành công" + newUser.getUserId());
            return ResponseEntity
                    .ok("Đăng ký thành công! User ID: " + newUser.getUserId() + "User email: " + newUser.getEmail());
        } catch (RuntimeException e) {
            System.out.println("Đăng ký người dùng thất bại! ");
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
