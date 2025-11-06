package edu.uth.evservice.models;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class CustomerUserDetails implements UserDetails{

    private final User user;

    public CustomerUserDetails(User user) {
        this.user = user;
    }


    // Trả về quyền được cấp cho người dùng
    // Ví dụ: GrantedAuthority = ROLE_TECHNICIAN.
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

    //. Trả về email
    @Override
    public String getUsername() {
        return user.getUsername();
    }

}
    
