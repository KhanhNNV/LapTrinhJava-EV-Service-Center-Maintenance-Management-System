package edu.uth.evservice.services.impl.auth.oauth2;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import edu.uth.evservice.models.CustomerUserDetails;
import edu.uth.evservice.models.User;
import edu.uth.evservice.services.impl.auth.oauth2.helpers.Oauth2UserProcessor;
import lombok.RequiredArgsConstructor;
/**
 *- Service này CHỈ xử lý các provider OIDC (như Google).
 *- Nó sẽ được "cắm" vào cổng .oidcUserService() trong SecurityConfig.
 */

@Service
@RequiredArgsConstructor
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser>{
    /**
     *. 1. NHẬN userRequest (chứa clientRegistration + authorization code)
     *.    ↓
     *. 2. GỬI request đến tokenUri của Google:
     *.    POST https://oauth2.googleapis.com/token
     *.    ↓  
     *. 3. NHẬN access_token + id_token từ Google
     *.    ↓
     *. 4. VERIFY JWT SIGNATURE của id_token
     *.    - Kiểm tra chữ ký số để xác thực token
     *.    - Verify issuer, audience, expiration
     *.    ↓
     *. 5. EXTRACT STANDARD CLAIMS từ id_token:
     *.    {
     *.      "iss": "https://accounts.google.com",
     *.      "sub": "123456789",
     *.      "aud": "your-client-id",
     *.      "exp": 1672531200,
     *.      "iat": 1672527600,
     *.      "name": "John Doe",
     *.      "email": "john@example.com",
     *.      "picture": "https://...",
     *.      "email_verified": true
     *.    }
     *.    ↓
     *. 6. BIẾN ĐỔI thành object OidcUser
     *.    - OidcUser kế thừa OAuth2User + có thêm ID Token claims
     *.    - Chứa Standard Claims được xác thực
     *.    ↓
     *. 7. TRẢ VỀ OidcUser với authenticated claims
     */
    private final OidcUserService oidcDelegate = new OidcUserService();
    //~ Class helper
    private final Oauth2UserProcessor userProcessor;
    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        //~ Gọi service OIDC mặc định để lấy OidcUser
        OidcUser oidcUser = oidcDelegate.loadUser(userRequest);
        
        //~ Lấy email, fullName từ đối tượng OidUser mà google trả về
        String email = oidcUser.getEmail();
        String fullName = oidcUser.getFullName();

        User user = userProcessor.processUser(email, fullName);


        return new CustomerUserDetails(
            user, oidcUser
        );
    }
    
}
