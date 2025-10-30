package edu.uth.evservice.EVService.services.impl.jwt;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.dto.jwt.JwtDto;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.requests.jwt.LoginRequest;
import edu.uth.evservice.EVService.requests.jwt.RegisterRequest;
import edu.uth.evservice.EVService.services.IUserService;
import edu.uth.evservice.EVService.services.jwt.IAuthenticaionService;
import edu.uth.evservice.EVService.services.jwt.IJwtService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements IAuthenticaionService {
    private final AuthenticationManager authenticationManager;
    private final IJwtService jwtService;
    private final IUserService userService;

    public JwtDto loginRequest (LoginRequest loginRequest){
        //~Tạo đối tượng UsernamePasswordAuthenticationToken từ email và password người dùng gửi lên
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );
        //~ Thực hiện xác thực bằng AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(authToken);
        //~ Này viết ra để kiểm tra lỗi
        Authentication authFromContext = SecurityContextHolder.getContext().getAuthentication();
        if (authFromContext != null && authFromContext.isAuthenticated()) {
            System.out.println("Người dùng '" + authentication.getName() + "' vừa đăng nhập thành công.");
        }
        //~ Tạo accessToken và refeshToken
        String accessToken = jwtService.generateAccessToken(authentication);
        String refreshToken = jwtService.generateRefeshToken(authentication);
    
        return new JwtDto(accessToken,refreshToken);
    }
    public UserDto registerRequest(RegisterRequest registerRequest){
        //~ Chuyển thằng registerRequest sang thằng createUserRequest
        CreateUserRequest createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername(registerRequest.getUsername());
        createUserRequest.setFullName(registerRequest.getFullName());
        createUserRequest.setEmail(registerRequest.getEmail());
        createUserRequest.setPassword(registerRequest.getPassword());
        createUserRequest.setPhoneNumber(registerRequest.getPhoneNumber());
        createUserRequest.setAddress(registerRequest.getAddress());
        createUserRequest.setRole(Role.CUSTOMER.name());
        try {
        return userService.createUser(createUserRequest);
        } catch (RuntimeException e) { 
        throw e;
    }
    }
}
    

