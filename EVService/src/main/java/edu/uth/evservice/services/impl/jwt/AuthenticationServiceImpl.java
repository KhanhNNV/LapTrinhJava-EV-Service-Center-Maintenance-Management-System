package edu.uth.evservice.services.impl.jwt;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.uth.evservice.dtos.UserDto;
import edu.uth.evservice.dtos.jwt.JwtDto;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.CreateUserRequest;
import edu.uth.evservice.requests.jwt.ForgotPasswordRequest;
import edu.uth.evservice.requests.jwt.LoginRequest;
import edu.uth.evservice.requests.jwt.RefreshTokenRequest;
import edu.uth.evservice.requests.jwt.RegisterRequest;
import edu.uth.evservice.services.IEmailService;
import edu.uth.evservice.services.IUserService;
import edu.uth.evservice.services.jwt.IAuthenticaionService;
import edu.uth.evservice.services.jwt.IJwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements IAuthenticaionService {
    private final AuthenticationManager authenticationManager;
    private final IJwtService jwtService;
    private final IUserService userService;
    private final IUserRepository userRepository;
    private final UserDetailsService userDetailsService;
    private final IEmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${serverFE}")
    private String serverFE;

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

    public UserDto registerRequest(RegisterRequest registerRequest) {
        // ~ Chuyển thằng registerRequest sang thằng createUserRequest
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

    // =========================== MAIL ============
    @Override
    public void sendRegistrationLink(RegisterRequest registerRequest) {
        // (Kiểm tra xem username/email đã tồn tại chưa)
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại.");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng.");
        }

        // 1. Tạo token tạm thời chứa thông tin đăng ký
        String token = jwtService.generateRegistrationToken(registerRequest);

        // KIỂM TRA DỮ LIỆU TRƯỚC KHI TẠO REQUEST DEBUG;
        System.out.println("🔍 Bước TẠO TOKEN");
        System.out.println("  - username: " + registerRequest.getUsername());
        System.out.println("  - fullName: " + registerRequest.getFullName());
        System.out.println("  - email: " + registerRequest.getEmail());
        System.out.println("  - password: " + registerRequest.getPassword());
        System.out.println("  - phoneNumber: " + registerRequest.getPhoneNumber());
        System.out.println("  - address: " + registerRequest.getAddress());

        // 2. Tạo link xác thực (Frontend URL)
        // Chú ý: Đây là URL của FE, không phải BE
        String verificationLink = serverFE + "/auth/callback?tokenDK=" + token;

        // 3. Tạo nội dung Email (HTML) với thiết kế chuyên nghiệp
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <title>EV Service Center</title>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;'>"
                +
                "    <div style='max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);'>"
                +
                "        " +
                "        <!-- Header với gradient giống UI -->" +
                "        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;'>"
                +
                "            <!-- Icon xe điện -->" +
                "            <div style='width: 100px; height: 100px; margin: 0 auto 20px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);'>"
                +
                "                <svg width='60' height='60' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
                +
                "                    <path d='M18 16H6C4.9 16 4 15.1 4 14V6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V14C20 15.1 19.1 16 18 16Z' stroke='#667eea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
                +
                "                    <circle cx='7.5' cy='18.5' r='1.5' fill='#667eea'/>" +
                "                    <circle cx='16.5' cy='18.5' r='1.5' fill='#667eea'/>" +
                "                    <path d='M14 10L16 8L14 6' stroke='#764ba2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
                +
                "                </svg>" +
                "            </div>" +
                "            <h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;'>EV Service Center</h1>"
                +
                "            <p style='color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;'>Hệ thống Quản lý Bảo dưỡng Xe điện</p>"
                +
                "        </div>" +
                "        " +
                "        <!-- Content -->" +
                "        <div style='padding: 40px 30px;'>" +
                "            <h2 style='color: #1a202c; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;'>Xin chào "
                + registerRequest.getFullName() + "!</h2>" +
                "            " +
                "            <p style='color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;'>" +
                "                Cảm ơn bạn đã đăng ký tài khoản tại <strong style='color: #667eea;'>EV Service Center</strong>. "
                +
                "                Chúng tôi rất vui được chào đón bạn đến với hệ thống quản lý bảo dưỡng xe điện hàng đầu."
                +
                "            </p>" +
                "            " +
                "            <p style='color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;'>" +
                "                Để hoàn tất quá trình đăng ký và kích hoạt tài khoản, vui lòng nhấp vào nút bên dưới:"
                +
                "            </p>" +
                "            " +
                "            <!-- Button xác thực -->" +
                "            <div style='text-align: center; margin: 40px 0;'>" +
                "                <a href='" + verificationLink
                + "' style='display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;'>Xác thực tài khoản</a>"
                +
                "            </div>" +
                "            " +
                "            <!-- Thông tin tài khoản -->" +
                "            <div style='background: #f7fafc; border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #667eea;'>"
                +
                "                <h3 style='color: #2d3748; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;'>📋 Thông tin tài khoản của bạn:</h3>"
                +
                "                <table style='width: 100%; border-collapse: collapse;'>" +
                "                    <tr>" +
                "                        <td style='padding: 8px 0; color: #718096; font-size: 14px;'>Họ và tên:</td>" +
                "                        <td style='padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600; text-align: right;'>"
                + registerRequest.getFullName() + "</td>" +
                "                    </tr>" +
                "                    <tr>" +
                "                        <td style='padding: 8px 0; color: #718096; font-size: 14px;'>Tên đăng nhập:</td>"
                +
                "                        <td style='padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600; text-align: right;'>"
                + registerRequest.getUsername() + "</td>" +
                "                    </tr>" +
                "                    <tr>" +
                "                        <td style='padding: 8px 0; color: #718096; font-size: 14px;'>Email:</td>" +
                "                        <td style='padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600; text-align: right;'>"
                + registerRequest.getEmail() + "</td>" +
                "                    </tr>" +
                "                </table>" +
                "            </div>" +
                "            " +
                "            <!-- Warning box -->" +
                "            <div style='background: #fff5f5; border-left: 4px solid #f56565; padding: 15px; border-radius: 8px; margin: 20px 0;'>"
                +
                "                <p style='color: #c53030; margin: 0; font-size: 14px; line-height: 1.5;'>" +
                "                    <strong>⏰ Lưu ý quan trọng:</strong> Link xác thực này chỉ có hiệu lực trong <strong>15 phút</strong>. "
                +
                "                    Nếu link hết hạn, bạn cần đăng ký lại." +
                "                </p>" +
                "            </div>" +
                "            " +
                "            <!-- Alternative link -->" +
                "            <p style='color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;'>" +
                "                Nếu nút bên trên không hoạt động, vui lòng sao chép và dán đường link sau vào trình duyệt:"
                +
                "            </p>" +
                "            <div style='background: #edf2f7; padding: 12px; border-radius: 8px; margin: 10px 0; word-break: break-all;'>"
                +
                "                <a href='" + verificationLink
                + "' style='color: #667eea; font-size: 13px; text-decoration: none;'>" + verificationLink + "</a>" +
                "            </div>" +
                "            " +
                "            <!-- Divider -->" +
                "            <div style='border-top: 1px solid #e2e8f0; margin: 30px 0;'></div>" +
                "            " +
                "            <!-- Support info -->" +
                "            <p style='color: #718096; font-size: 14px; line-height: 1.6; margin: 0;'>" +
                "                Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi để được hỗ trợ."
                +
                "            </p>" +
                "        </div>" +
                "        " +
                "        <!-- Footer -->" +
                "        <div style='background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;'>"
                +
                "            <p style='color: #4a5568; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;'>EV Service Center</p>"
                +
                "            <p style='color: #718096; font-size: 13px; margin: 0 0 15px 0;'>Hệ thống Quản lý Bảo dưỡng Xe điện</p>"
                +
                "            " +
                "            <div style='margin: 15px 0;'>" +
                "                <a href='mailto:support@evservice.com' style='color: #667eea; text-decoration: none; font-size: 13px; margin: 0 10px;'>📧 thuanthong675@gmail.com</a>"
                +
                "                <span style='color: #cbd5e0;'>|</span>" +
                "                <a href='tel:+84123456789' style='color: #667eea; text-decoration: none; font-size: 13px; margin: 0 10px;'>📞 (+84) 90 284 62 05</a>"
                +
                "            </div>" +
                "            " +
                "            <p style='color: #a0aec0; font-size: 12px; margin: 15px 0 0 0;'>" +
                "                © 2025 EV Service Center. All rights reserved." +
                "            </p>" +
                "        </div>" +
                "    </div>" +
                "    " +
                "    <!-- Responsive adjustments -->" +
                "    <style>" +
                "        @media only screen and (max-width: 600px) {" +
                "            .content { padding: 20px !important; }" +
                "            h1 { font-size: 24px !important; }" +
                "            h2 { font-size: 20px !important; }" +
                "        }" +
                "    </style>" +
                "</body>" +
                "</html>";

        // 4. Gửi email
        emailService.sendHtmlEmail(registerRequest.getEmail(), "EV Service", htmlContent);
    }

    @Override
    @Transactional
    public JwtDto verifyRegistrationAndLogin(String token) {
        try {
            // 1. Xác thực token
            if (!jwtService.verifyToken(token)) {
                throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn.");
            }

            // 2. Kiểm tra loại token
            String tokenType = (String) jwtService.getClaim(token, "token_type");
            if (!"registration".equals(tokenType)) {
                throw new RuntimeException("Đây không phải là token đăng ký.");
            }

            // KIỂM TRA DỮ LIỆU TRƯỚC KHI TẠO REQUEST DEBUG;
            System.out.println("BƯỚC DÙNG GIẢI TOKEN");
            System.out.println("  - username: " + (String) jwtService.getClaim(token, "username"));
            System.out.println("  - fullName: " + (String) jwtService.getClaim(token, "fullName"));
            System.out.println("  - email: " + (String) jwtService.getClaim(token, "email"));
            System.out.println("  - password: " + (String) jwtService.getClaim(token, "password"));
            System.out.println("  - phoneNumber: " + (String) jwtService.getClaim(token, "phoneNumber"));
            System.out.println("  - address: " + (String) jwtService.getClaim(token, "address"));

            // 3. Lấy thông tin từ token
            RegisterRequest requestData = new RegisterRequest();
            requestData.setUsername((String) jwtService.getClaim(token, "username"));
            requestData.setFullName((String) jwtService.getClaim(token, "fullName"));
            requestData.setEmail((String) jwtService.getClaim(token, "email"));
            requestData.setPassword((String) jwtService.getClaim(token, "password"));
            requestData.setPhoneNumber((String) jwtService.getClaim(token, "phoneNumber"));
            requestData.setAddress((String) jwtService.getClaim(token, "address"));

            // 4. Tạo User (sử dụng logic cũ của bạn)
            UserDto newUser = this.registerRequest(requestData); // Gọi hàm registerRequest cũ

            // 5. Tự động đăng nhập cho họ
            // Tải UserDetails vừa tạo
            UserDetails userDetails = userDetailsService.loadUserByUsername(newUser.getUsername());

            // Tạo Authentication
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null, // Không cần password
                    userDetails.getAuthorities());

            // 6. Tạo token đăng nhập
            String accessToken = jwtService.generateAccessToken(authentication);
            String refreshToken = jwtService.generateRefreshToken(authentication);

            return new JwtDto(accessToken, refreshToken);

        } catch (Exception e) {
            throw new RuntimeException("Xác thực thất bại: " + e.getMessage());
        }
    }

    // START: Thêm hàm tạo mật khẩu ngẫu nhiên
    private String generateRandomPassword(int length) {
        String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
        String CHAR_UPPER = CHAR_LOWER.toUpperCase();
        String NUMBER = "0123456789";
        String OTHER_CHAR = "!@#$%^&*()_+-=[]?";
        String PASSWORD_ALLOW_BASE = CHAR_LOWER + CHAR_UPPER + NUMBER + OTHER_CHAR;
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int rndCharAt = random.nextInt(PASSWORD_ALLOW_BASE.length());
            char rndChar = PASSWORD_ALLOW_BASE.charAt(rndCharAt);
            sb.append(rndChar);
        }
        return sb.toString();
    }

    // END
    // START: Triển khai 2 hàm mới
    @Override
    @Transactional
    public void sendPasswordResetLink(ForgotPasswordRequest request) {
        // 1. Tìm user bằng email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này."));

        // 2. Tạo mật khẩu ngẫu nhiên mới (ví dụ 10 ký tự)
        String newPassword = generateRandomPassword(10);

        // 3. Cập nhật mật khẩu mới (đã mã hóa) cho user
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 4. Tải UserDetails để tạo Authentication
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        // 5. Tạo token reset (ví dụ: 15 phút)
        String token = jwtService.generatePasswordResetToken(authentication);

        // 6. Tạo link (URL của FE)
        String resetLink = serverFE + "/auth/callback?tokenQMK=" + token;

        // 7. Gửi email
        String htmlContent = "<!DOCTYPE html>" +
                "<html lang='vi'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <title>Đặt lại mật khẩu - EV Service Center</title>" +
                "</head>" +
                "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;'>"
                +
                "    <div style='max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);'>"
                +
                "        " +
                "        <!-- Header với gradient -->" +
                "        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;'>"
                +
                "            <!-- Icon xe điện -->" +
                "            <div style='width: 100px; height: 100px; margin: 0 auto 20px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);'>"
                +
                "                <svg width='60' height='60' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
                +
                "                    <path d='M18 16H6C4.9 16 4 15.1 4 14V6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V14C20 15.1 19.1 16 18 16Z' stroke='#667eea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
                +
                "                    <circle cx='7.5' cy='18.5' r='1.5' fill='#667eea'/>" +
                "                    <circle cx='16.5' cy='18.5' r='1.5' fill='#667eea'/>" +
                "                    <path d='M14 10L16 8L14 6' stroke='#764ba2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
                +
                "                </svg>" +
                "            </div>" +
                "            <h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;'>EV Service Center</h1>"
                +
                "            <p style='color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;'>Hệ thống Quản lý Bảo dưỡng Xe điện</p>"
                +
                "        </div>" +
                "        " +
                "        <!-- Content -->" +
                "        <div style='padding: 40px 30px;'>" +
                "            <!-- Icon cảnh báo -->" +
                "            <div style='text-align: center; margin-bottom: 20px;'>" +
                "                <div style='width: 80px; height: 80px; margin: 0 auto; background: #fff5f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;'>"
                +
                "                    🔐" +
                "                </div>" +
                "            </div>" +
                "            " +
                "            <h2 style='color: #1a202c; font-size: 24px; margin: 0 0 20px 0; font-weight: 600; text-align: center;'>Yêu cầu Đặt lại Mật khẩu</h2>"
                +
                "            " +
                "            <p style='color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;'>" +
                "                Xin chào <strong style='color: #667eea;'>" + user.getFullName() + "</strong>," +
                "            </p>" +
                "            " +
                "            <p style='color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;'>" +
                "                Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. " +
                "                Để đảm bảo an toàn, chúng tôi đã tạo một mật khẩu mới cho bạn." +
                "            </p>" +
                "            " +
                "            <!-- Mật khẩu mới -->" +
                "            <div style='background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 12px; margin: 30px 0;'>"
                +
                "                <h3 style='color: #2d3748; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;'>🔑 Mật khẩu mới của bạn:</h3>"
                +
                "                <div style='background: white; padding: 15px; border-radius: 8px; text-align: center; font-family: \"Courier New\", monospace; font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; border: 2px dashed #667eea;'>"
                +
                "                    " + newPassword +
                "                </div>" +
                "            </div>" +
                "            " +
                "            <p style='color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;'>" +
                "                Nhấp vào nút bên dưới để đăng nhập ngay lập tức với mật khẩu mới:" +
                "            </p>" +
                "            " +
                "            <!-- Button đăng nhập -->" +
                "            <div style='text-align: center; margin: 40px 0;'>" +
                "                <a href='" + resetLink
                + "' style='display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);'>Đăng nhập ngay</a>"
                +
                "            </div>" +
                "            " +
                "            <!-- Warning box BẢO MẬT -->" +
                "            <div style='background: #fff5f5; border-left: 4px solid #f56565; padding: 20px; border-radius: 8px; margin: 30px 0;'>"
                +
                "                <h4 style='color: #c53030; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;'>⚠️ Lưu ý quan trọng về bảo mật:</h4>"
                +
                "                <ul style='color: #c53030; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;'>"
                +
                "                    <li><strong>KHÔNG chia sẻ</strong> mật khẩu này với bất kỳ ai</li>" +
                "                    <li>Đổi mật khẩu mới ngay sau khi đăng nhập</li>" +
                "                    <li>Link chỉ có hiệu lực trong <strong>15 phút</strong></li>" +
                "                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy liên hệ với chúng tôi ngay</li>" +
                "                </ul>" +
                "            </div>" +
                "            " +
                "            <!-- Thông tin tài khoản -->" +
                "            <div style='background: #f7fafc; border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #667eea;'>"
                +
                "                <h3 style='color: #2d3748; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;'>📋 Thông tin tài khoản:</h3>"
                +
                "                <table style='width: 100%; border-collapse: collapse;'>" +
                "                    <tr>" +
                "                        <td style='padding: 8px 0; color: #718096; font-size: 14px;'>Tên đăng nhập:</td>"
                +
                "                        <td style='padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600; text-align: right;'>"
                + user.getUsername() + "</td>" +
                "                    </tr>" +
                "                    <tr>" +
                "                        <td style='padding: 8px 0; color: #718096; font-size: 14px;'>Email:</td>" +
                "                        <td style='padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600; text-align: right;'>"
                + user.getEmail() + "</td>" +
                "                    </tr>" +
                "                </table>" +
                "            </div>" +
                "            " +
                "            <!-- Alternative link -->" +
                "            <p style='color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;'>" +
                "                Nếu nút bên trên không hoạt động, vui lòng sao chép và dán đường link sau vào trình duyệt:"
                +
                "            </p>" +
                "            <div style='background: #edf2f7; padding: 12px; border-radius: 8px; margin: 10px 0; word-break: break-all;'>"
                +
                "                <a href='" + resetLink
                + "' style='color: #667eea; font-size: 13px; text-decoration: none;'>" + resetLink + "</a>" +
                "            </div>" +
                "            " +
                "            <!-- Divider -->" +
                "            <div style='border-top: 1px solid #e2e8f0; margin: 30px 0;'></div>" +
                "            " +
                "            <!-- Support info -->" +
                "            <p style='color: #718096; font-size: 14px; line-height: 1.6; margin: 0;'>" +
                "                Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ với chúng tôi ngay lập tức để bảo vệ tài khoản của bạn."
                +
                "            </p>" +
                "        </div>" +
                "        " +
                "        <!-- Footer -->" +
                "        <div style='background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;'>"
                +
                "            <p style='color: #4a5568; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;'>EV Service Center</p>"
                +
                "            <p style='color: #718096; font-size: 13px; margin: 0 0 15px 0;'>Hệ thống Quản lý Bảo dưỡng Xe điện</p>"
                +
                "            " +
                "            <div style='margin: 15px 0;'>" +
                "                <a href='mailto:thuanthong675@gmail.com' style='color: #667eea; text-decoration: none; font-size: 13px; margin: 0 10px;'>📧 thuanthong675@gmail.com</a>"
                +
                "                <span style='color: #cbd5e0;'>|</span>" +
                "                <a href='tel:+84902846205' style='color: #667eea; text-decoration: none; font-size: 13px; margin: 0 10px;'>📞 (+84) 90 284 62 05</a>"
                +
                "            </div>" +
                "            " +
                "            <p style='color: #a0aec0; font-size: 12px; margin: 15px 0 0 0;'>" +
                "                © 2025 EV Service Center. All rights reserved." +
                "            </p>" +
                "        </div>" +
                "    </div>" +
                "    " +
                "    <style>" +
                "        @media only screen and (max-width: 600px) {" +
                "            .content { padding: 20px !important; }" +
                "            h1 { font-size: 24px !important; }" +
                "            h2 { font-size: 20px !important; }" +
                "        }" +
                "    </style>" +
                "</body>" +
                "</html>";

        emailService.sendHtmlEmail(user.getEmail(), "EV Service", htmlContent);
    }

    @Override
    @Transactional
    public JwtDto verifyPasswordResetAndLogin(String token) {
        try {
            // 1. Xác thực token
            if (!jwtService.verifyToken(token)) {
                throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn.");
            }

            // 2. Kiểm tra loại token
            String tokenType = (String) jwtService.getClaim(token, "token_type");
            if (!"password_reset".equals(tokenType)) {
                throw new RuntimeException("Đây không phải là token đặt lại mật khẩu.");
            }

            // 3. Lấy UserID từ token (subject)
            String userId = jwtService.getSubject(token);

            // 4. Tải UserDetails
            User user = userRepository.findById(Integer.parseInt(userId))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());

            // 5. Tạo Authentication và trả về token đăng nhập
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            String accessToken = jwtService.generateAccessToken(authentication);
            String refreshToken = jwtService.generateRefreshToken(authentication);

            return new JwtDto(accessToken, refreshToken);

        } catch (Exception e) {
            throw new RuntimeException("Xác thực thất bại: " + e.getMessage());
        }
    }
    // END

}
