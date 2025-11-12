package edu.uth.evservice.services.impl.auth.oauth2.helper;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.CreateUserRequest;
import edu.uth.evservice.services.IUserService;
import lombok.RequiredArgsConstructor;

/**
 *- Lớp helper này chứa logic chung để "Tìm hoặc Tạo"
 *- người dùng từ thông tin OAuth2/OIDC.
 *- Nó được inject vào cả CustomOAuth2UserService và CustomOidcUserService để
 *- tuân thủ DRY (Don't Repeat Yourself).
 */
@Component
@RequiredArgsConstructor
public class Oauth2UserProcessor {
    private final IUserRepository userRepository;
    private final IUserService userService;
    private final PasswordEncoder passwordEncoder;

    public User processUser (String email, String fullName){
        // ~Kiểm tra tài khoản đã tồn tại chưa
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;
        if (userOptional.isPresent()) {
            // ========ĐĂNG NHẬP NHANH========/
            // -> Email đã tồn tại, Đăng nhập luôn
            user = userOptional.get();

        } else {
            // ========ĐĂNG KÝ NHANH==========/
            // ~Tạo một đối tượng Request
            CreateUserRequest newUserRequest = new CreateUserRequest();
            // ~Thêm email
            newUserRequest.setEmail(email);

            String usernameFormEmail = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
            String usernameReg;
            // ~Kiểm tra usernameFormEmail đã có ai dùng chưa
            if (userRepository.existsByUsername(usernameFormEmail)) {
                // ~Thêm tên người dùng
                // ~ Có 1 người dùng đăng kí username là THONG đi
                // ~ Xong có người thứ 2 đăng kí với email là THONG@GMAIL.COM
                // ~ Vì usename là unique thì phả đổi tên người đăng kí 2 đằng sau 1 cụm ký tự
                // ~ ngẫu nhiên
                // ~ VÍDỤ: THONG@GMAIL.COM ->THONG_1a2g
                usernameReg = usernameFormEmail + "_" + UUID.randomUUID().toString().substring(0, 4);
            } else {
                // ~ Nếu chưa có tên thì sử dụng tên đó luôn
                usernameReg = usernameFormEmail;
            }
            newUserRequest.setUsername(usernameReg);

            newUserRequest.setPhoneNumber("S" + UUID.randomUUID().toString().substring(0, 12));

            newUserRequest.setAddress("(Social Login)");

            newUserRequest.setFullName (fullName);

            newUserRequest.setRole(Role.CUSTOMER.name());// -> Mặc định vẫn là Customer

            // ~ Tạo mật khẩu ngẫu nhiên (vì trường password là not-null)
            newUserRequest.setPassword(passwordEncoder.encode("OAUTH_" + UUID.randomUUID().toString()));

            userService.createUser(newUserRequest);

            user = userRepository.findByEmail(email).orElseThrow(
                    () -> new RuntimeException("Khong the tim thay user vua tao. "));
        }
        return user;
    }
}
