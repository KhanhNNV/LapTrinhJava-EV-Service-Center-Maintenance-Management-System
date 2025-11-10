package edu.uth.evservice.models;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

public class CustomerUserDetails implements UserDetails, OidcUser{

    private Map<String, Object> attributes;
    private final User user;

    //~ Các trường của OidcUser
    private OidcIdToken idToken;
    private OidcUserInfo userInfo;

     //============================CONTRUCTOR==============================

    //~ Contructor cho (Form/JWT)
    public CustomerUserDetails(User user) {
        this.user = user;
    }

    //~ Contructor cho OAuth2User (NON-OIDC: Facebook, GitHub)
    public CustomerUserDetails(User user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    //~ Contructor cho OidcUser (OIDC: Google)
    public CustomerUserDetails(User user, OidcUser oidcUser) {
        this.user = user;
        this.attributes = oidcUser.getAttributes();
        this.idToken = oidcUser.getIdToken();
        this.userInfo = oidcUser.getUserInfo();
    }


    public User getUser() {
        return this.user;
    }

    public Integer getId() {
        return user.getUserId();
    }



    //===================Phương thức UserDetails ===========================

    //. Trả về quyền được cấp cho người dùng
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        return Collections.singleton(authority);
    }
    
    //. Trả về mật khẩu
    @Override
    public String getPassword() {
        return user.getPassword();
    }

    //. Trả về userName
    @Override
    public String getUsername() {
        return user.getUsername();
    }

    //===================Phương thức Oauthe2User và OdicUser===========================

    @Override
    public Map<String, Object> getAttributes() {
        return this.attributes;
    }


    @Override
    public String getName() {
        return this.user.getUsername();
    }


    @Override
    public Map<String, Object> getClaims() {
        //~ Ưu tiên claims từ IdToken, nếu không có thì dùng attributes
        return (this.idToken != null) ? this.idToken.getClaims() : this.attributes;
    }


    @Override
    public OidcIdToken getIdToken() {
        return this.idToken;
    }


    @Override
    public OidcUserInfo getUserInfo() {
        return this.userInfo;
    }


}
    
