package edu.uth.evservice.EVService.model;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class CustomerUserDetails implements UserDetails, OAuth2User{

    private Map<String, Object> attributes;
    
    private final User user;

    //~ Contructor cho (Form/JWT)
    public CustomerUserDetails(User user) {
        this.user = user;
    }
    
    //~ Contructor cho OAuth2User
    public CustomerUserDetails(User user,Map<String, Object> attributes){
        this.user=user;
        this.attributes=attributes;
    }

    public User getUser(){
        return this.user;
    }

    public Integer getId(){
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

    
    //===================Phương thức UserDetails ===========================
    
    @Override
    public Map<String, Object> getAttributes() {
        return this.attributes;
    }

    @Override
    public String getName() {
        return this.user.getUsername();
    }
    

}
    
