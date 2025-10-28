package edu.uth.evservice.EVService.services.impl.jwt;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.model.CustomerUserDetails;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailServiceCustomizerImpl implements UserDetailsService {
    private final IUserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
       User user = userRepository.findByEmail(email)
       .orElseThrow(()->new UsernameNotFoundException("Không tìm thấy người dùng với email: "));
        return new CustomerUserDetails(user);
    }


    
}
