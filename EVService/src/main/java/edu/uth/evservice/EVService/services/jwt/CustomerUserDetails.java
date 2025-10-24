package edu.uth.evservice.EVService.services.jwt;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.model.User;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerUserDetails implements UserDetails{

    private final User user;
    

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

    //. Trả về email
    @Override
    public String getUsername() {
        return user.getEmail();
    }

}
    
