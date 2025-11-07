//. File quản lý vòng đời của Token từ login/register/refesh
package edu.uth.evservice.EVService.services.impl.jwt;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.dto.jwt.JwtDto;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.requests.jwt.LoginRequest;
import edu.uth.evservice.EVService.requests.jwt.RefreshTokenRequest;
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
    private final IUserRepository userRepository;
    private final UserDetailsService userDetailsService;

    public JwtDto loginRequest (LoginRequest loginRequest){
        //~Tạo đối tượng UsernamePasswordAuthenticationToken từ email và password người dùng gửi lên
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getUsernameOrEmail(),
                loginRequest.getPassword()
        );
        //~ Thực hiện xác thực bằng AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(authToken);
        //~ Này viết ra để kiểm tra lỗi
        Authentication authFromContext = SecurityContextHolder.getContext().getAuthentication();
        if (authFromContext != null && authFromContext.isAuthenticated()) {
            System.out.println("Nguoi dung '" + authentication.getName() + "' vua dang nhap thanh cong.");
        }
        //~ Tạo accessToken và refeshToken
        String accessToken = jwtService.generateAccessToken(authentication);
        String refreshToken = jwtService.generateRefreshToken(authentication);
    
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

    //. Tạo mới thằng accessToken khi còn refeshToken
    public JwtDto refreshToken (RefreshTokenRequest refeshTokenRequest){
        try{             
            String refreshToken = refeshTokenRequest.getRefreshToken();

            //~ Kiểm tra refesh token hợp lệ không
            if(! jwtService.verifyToken(refreshToken)){
                throw new RuntimeException("Refresh token khong con hop le");
            }

            //~ Kiểm tra xem có đúng loại refreshToken không
            String tokenType = (String) jwtService.getClaim(refreshToken, "token_type");
            if (tokenType == null || !"refresh".equals(tokenType.toString())){
                throw new RuntimeException("Token khong phai la refresh token va day la token null");
            }
            //~ Lấy userId từ refesh Token
            String userId = jwtService.getSubject(refreshToken);

            //~ Tải thông tin từ user từ DB về
            User user = userRepository.findById(Integer.parseInt(userId))
                    .orElseThrow(()-> new RuntimeException("Khong the tim thay user"));

            //~ Tải userDetail
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            
            //~ Tạo đối tượng authentication với không password
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, 
                null, 
                userDetails.getAuthorities()
            );

            //~ Tạo access Token mới
            String newAccessToken = jwtService.generateAccessToken(authentication);

            return new JwtDto(newAccessToken, refreshToken);
        } catch (Exception e) {
            throw new RuntimeException("Khong the tao token: " + e.getMessage(), e);
        }
    }
}
    

