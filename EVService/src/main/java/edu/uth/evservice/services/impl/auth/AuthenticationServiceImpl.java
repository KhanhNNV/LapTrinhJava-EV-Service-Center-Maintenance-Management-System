package edu.uth.evservice.services.impl.auth;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.uth.evservice.dtos.jwt.JwtDto;
import edu.uth.evservice.models.EmailVerificationToken;
import edu.uth.evservice.models.PasswordResetToken;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.repositories.IEmailVerificationTokenRepository;
import edu.uth.evservice.repositories.IPasswordResetTokenRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.ChangePasswordRequest;
import edu.uth.evservice.requests.jwt.LoginRequest;
import edu.uth.evservice.requests.jwt.RefreshTokenRequest;
import edu.uth.evservice.requests.jwt.RegisterRequest;
import edu.uth.evservice.requests.jwt.ResendVerificationRequest;
import edu.uth.evservice.services.IEmailService;
import edu.uth.evservice.services.IUserService;
import edu.uth.evservice.services.auth.IAuthenticaionService;
import edu.uth.evservice.services.auth.IJwtService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements IAuthenticaionService {
    private final AuthenticationManager authenticationManager;
    private final IJwtService jwtService;
    private final IUserService userService;
    private final IUserRepository userRepository;
    private final UserDetailsService userDetailsService;
    private final IEmailVerificationTokenRepository emailVerificationTokenRepository;
    private final IPasswordResetTokenRepository passwordResetTokenRepository;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.verify-email-url}")
    private String verifyEmailUrl;

    @Value("${app.reset-password-url}")
    private String resetPasswordUrl;

    public JwtDto loginRequest(LoginRequest loginRequest) {
        // ~Tạo đối tượng UsernamePasswordAuthenticationToken từ email và password người
        // dùng gửi lên
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getUsernameOrEmail(),
                loginRequest.getPassword());
        // ~ Thực hiện xác thực bằng AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(authToken);
        // ~ Này viết ra để kiểm tra lỗi
        Authentication authFromContext = SecurityContextHolder.getContext().getAuthentication();
        if (authFromContext != null && authFromContext.isAuthenticated()) {
            System.out.println("Người dùng '" + authentication.getName() + "' vừa đăng nhập thành công.");
        }
        // ~ Tạo accessToken và refeshToken
        String accessToken = jwtService.generateAccessToken(authentication);
        String refreshToken = jwtService.generateRefreshToken(authentication);

        return new JwtDto(accessToken, refreshToken);
    }


    // . Tạo mới thằng accessToken khi còn refeshToken
    public JwtDto refreshToken(RefreshTokenRequest refeshTokenRequest) {
        try {
            String refreshToken = refeshTokenRequest.getRefreshToken();

            // ~ Kiểm tra refesh token hợp lệ không
            if (!jwtService.verifyToken(refreshToken)) {
                throw new RuntimeException("Refresh token khong con hop le");
            }

            // ~ Kiểm tra xem có đúng loại refreshToken không
            String tokenType = (String) jwtService.getClaim(refreshToken, "token_type");
            if (tokenType == null || !"refresh".equals(tokenType.toString())) {
                throw new RuntimeException("Token khong phai la refresh token va day la token null");
            }
            // ~ Lấy userId từ refesh Token
            String userId = jwtService.getSubject(refreshToken);

            // ~ Tải thông tin từ user từ DB về
            User user = userRepository.findById(Integer.parseInt(userId))
                    .orElseThrow(() -> new RuntimeException("Khong the tim thay user"));

            // ~ Tải userDetail
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

            // ~ Tạo đối tượng authentication với không password
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities());

            // ~ Tạo access Token mới
            String newAccessToken = jwtService.generateAccessToken(authentication);

            return new JwtDto(newAccessToken, refreshToken);
        } catch (Exception e) {
            throw new RuntimeException("Khong the tao token: " + e.getMessage(), e);
        }
    }

    // ==============================================================
    // ĐĂNG KÝ + GỬI EMAIL XÁC THỰC
    // ==============================================================


    @Override
    @Transactional
    public String registerRequest(RegisterRequest request) {
        // Kiểm tra trùng
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalStateException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email đã được sử dụng");
        }

        // Tạo token xác thực bằng JwtService
        String token = jwtService.generateVerificationToken(request);

        // Gửi email - thêm ?token= vào URL để frontend có thể đọc được
        String link = verifyEmailUrl + "?token=" + token;
        emailService.sendVerificationEmail(request.getEmail(), link);

        return "Vui lòng kiểm tra email để hoàn tất đăng ký.";
    }

    // ==============================================================
    // XÁC THỰC EMAIL
    // ==============================================================


    @Override
    @Transactional
    public void verifyEmail(String token) {
        try {
            // 1. Xác thực token
            if (!jwtService.verifyToken(token)) {
                throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn");
            }

            // 2. Kiểm tra loại token
            String type = (String) jwtService.getClaim(token, "type");
            if (!"verification".equals(type)) {
                throw new RuntimeException("Token không dùng để xác thực email");
            }

            // 3. Lấy dữ liệu
            String username = (String) jwtService.getClaim(token, "username");
            String email = (String) jwtService.getClaim(token, "email");
            String fullName = (String) jwtService.getClaim(token, "fullName");
            String password = (String) jwtService.getClaim(token, "password");
            String roleStr = (String) jwtService.getClaim(token, "role");
            Role role = Role.valueOf(roleStr);

            // 4. Kiểm tra trùng lần cuối
            if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
                throw new IllegalStateException("Tài khoản đã tồn tại");
            }

            // 5. Tạo user
            User user = User.builder()
                    .username(username)
                    .email(email)
                    .fullName(fullName)
                    .password(password)
                    .role(role)
                    .enabled(true)
                    .build();
            userRepository.save(user);

        } catch (Exception e) {
            throw new RuntimeException("Xác thực thất bại: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public String resendVerificationEmail(ResendVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Email không tồn tại"));

        if (user.isEnabled()) {
            throw new IllegalStateException("Tài khoản đã được xác thực");
        }

        emailVerificationTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verifyToken = EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        emailVerificationTokenRepository.save(verifyToken);

        String link = verifyEmailUrl + "?token=" + token;
        emailService.sendVerificationEmail(user.getEmail(), link);

        return "Email xác thực đã được gửi lại!";
    }

    // ==============================================================
    // QUÊN MẬT KHẨU – GỬI EMAIL RESET
    // ==============================================================
    @Override
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            // Không tiết lộ email tồn tại hay không
            return;
        }

        // Mỗi user chỉ giữ 1 reset token active → xoá token cũ
        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15)) // 15 phút hết hạn
                .build();
        passwordResetTokenRepository.save(resetToken);

        String resetLink = resetPasswordUrl + "?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    // ==============================================================
    // ĐẶT LẠI MẬT KHẨU
    // ==============================================================
    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token đặt lại mật khẩu không hợp lệ"));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đặt lại mật khẩu đã hết hạn");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xoá token để không dùng lại được
        passwordResetTokenRepository.delete(resetToken);
    }


    // ==============================================================
    // ĐẶT LẠI MẬT KHẨU Ở SETTING
    // ==============================================================
    @Override
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // 1. Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác");
        }

        // 2. Kiểm tra xác nhận mật khẩu
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp");
        }

        // 3. Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
