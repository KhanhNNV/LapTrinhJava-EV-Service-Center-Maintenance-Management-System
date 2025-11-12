package edu.uth.evservice.services.impl.auth.oauth2;

import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import edu.uth.evservice.models.CustomerUserDetails;
import edu.uth.evservice.models.User;
import edu.uth.evservice.services.impl.auth.oauth2.helper.Oauth2UserProcessor;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
/**
 *- Service này xử lý các provider OAuth2 (như Facebook, GitHub).
 *- Nó sẽ được "cắm" vào cổng .userService() trong SecurityConfig.
 */
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final Oauth2UserProcessor userProcessor;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        /**
        *. 1. 📨 NHẬN userRequest (chứa clientRegistration + accessToken)
        *.↓
        *.2. 🔗 GỬI request đến tokenUri của Google:
        *.POST https://oauth2.googleapis.com/token
        *.↓  
        *.3. 🔑 NHẬN access_token từ Google
        *.↓
        *.4. 👤 GỬI request đến userInfoUri của Google:
        *.GET https://www.googleapis.com/oauth2/v3/userinfo
        *.Header: Authorization: Bearer {access_token}
        *.↓
        *.5. 📄 NHẬN JSON user info từ Google:
        *.{
        *.    "sub": "123456789",
        *.    "name": "John Doe", 
        *.    "email": "john@example.com",
        *.}
        *.↓
        *.6. 🎭 BIẾN ĐỔI thành object OAuth2User
        *.↓
        *.7. ✅ TRẢ VỀ cho bạn
        */
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        //~ Chuyển đổi thông tin được lấy về từ thằng oAuth2User
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        // ~Lấy tên nhà cung cấp
        String provider = userRequest.getClientRegistration().getRegistrationId();
        
        String email;
        String userName;

        // -> Mỗi nhà provider trả về kiểu dữ liệu khác nhau nên phân tách ở đây
        // ~ Phân luồng xử lý: OIDC (như Google) và OAuth2 thuần (như Facebook, GitHub)
        if (provider.equals("facebook")) {
            // ~Facebook có thể không trả về email nếu người dùng từ chối
            email = (String) attributes.get("email");
            userName = (String) attributes.get("name");
            if (email == null) {
                email = attributes.get("id").toString() + "@facebook.com";
            }
        } else if (provider.equals("github")) {
            email = (String) attributes.get("email");
            userName = (String) attributes.get("login"); // ! GitHub dùng "login" cho tên
            if (email == null) {
                // ~Rất phổ biến với GitHub, người dùng có thể giấu email
                // ~Chúng ta tạo email ảo dựa trên ID của họ
                email = attributes.get("id").toString() + "@github.com";
            }
        } else {
            throw new OAuth2AuthenticationException("Provider không được hỗ trợ: " + provider);
        }

        User user = userProcessor.processUser(email, userName);

            return new CustomerUserDetails(user, attributes); // <-- Gọi constructor OAuth2
        }
    }
