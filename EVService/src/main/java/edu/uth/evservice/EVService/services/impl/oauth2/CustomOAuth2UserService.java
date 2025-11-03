package edu.uth.evservice.EVService.services.impl.oauth2;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
    
import edu.uth.evservice.EVService.model.CustomerUserDetails;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.services.IUserService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
//. Kế thừa từ thằng DefaultOAuth2UserService mặc định của thằng Spring Security
//~ Mục đích:
/// Can thiệp giữa bước lấy dữ liệu và trả dữ liệu về
/// Xữ lý user nếu chưa tồn tại trong database, tự động đăng kí
/// Gán thêm role,.....
public class CustomOAuth2UserService extends DefaultOAuth2UserService{
    private final IUserRepository userRepository;
    private final IUserService userService;
    private final PasswordEncoder passwordEncoder;


    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        //~Lấy dữ liệu user từ nhà cung cấp (provider: Google, Faceboook, Github)
        OAuth2User oAuth2User = super.loadUser(userRequest);

        //~Lấy các thuộc tính 
        Map<String, Object> attributes = oAuth2User.getAttributes();

        //~Lấy tên nhà cung cấp
        String provider = userRequest.getClientRegistration().getRegistrationId();//goole, github, facebook

        String email;
        String userName;

        //-> Mỗi nhà provider trả về kiểu dữ liệu khác nhau nên phân tách ở đây
        if (provider.equals("google")){
            email = (String) attributes.get("email");
            userName = (String) attributes.get("name");
        }else if (provider.equals("facebook")){
            //~Facebook có thể không trả về email nếu người dùng từ chối
            email = (String) attributes.get("email");
            userName = (String) attributes.get("name");
            if (email == null) {
                email = attributes.get("id").toString() + "@facebook.com"; 
            }
        }else if (provider.equals("github")){
            email = (String) attributes.get("email");
            userName = (String) attributes.get("login"); //! GitHub dùng "login" cho tên
            if (email == null) {
                //~Rất phổ biến với GitHub, người dùng có thể giấu email
                //~Chúng ta tạo email ảo dựa trên ID của họ
                email = attributes.get("id").toString() + "@github.com"; 
            }
        }else{
            throw new OAuth2AuthenticationException("Provider không được hỗ trợ");
        }

        //~Kiểm tra tài khoản đã tồn tại chưa
        Optional<User> userOptional = userRepository.findByEmail(email);

        User user;

        if (userOptional.isPresent()){
            //========ĐĂNG NHẬP NHANH========/
            user = userOptional.get();

        }else{
            //========ĐĂNG KÝ NHANH==========/
            //~Tạo một đối tượng Request
            CreateUserRequest newUserRequest = new CreateUserRequest();
            //~Thêm email
            newUserRequest.setEmail(email);
            //~Thêm tên người dùng
            //~ Có 1 người dùng đăng kí username là THONG đi
            //~ Xong có người thứ 2 đăng kí với email là THONG@GMAIL.COM
            //~ Vì usename là unique thì phả đổi tên người đăng kí 2 đằng sau 1 cụm ký tự ngẫu nhiên
            //~ VÍDỤ:  THONG@GMAIL.COM ->THONG_1a2g
            String username = email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 4);
            newUserRequest.setUsername(username);

            newUserRequest.setFullName(userName);
            newUserRequest.setRole(Role.CUSTOMER.name());//-> Mặc định vẫn là Customer

            //~ Tạo mật khẩu ngẫu nhiên (vì trường password là not-null)
            newUserRequest.setPassword(passwordEncoder.encode("OAUTH_"+ UUID.randomUUID().toString()));


            userService.createUser(newUserRequest);

            user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Khong the tim thay user vua tao. "));
        }  
        return new CustomerUserDetails(user, attributes);
    }
}
