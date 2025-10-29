package edu.uth.evservice.EVService.services.jwt;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailServiceCustomizerImpl implements UserDetailsService {
    private final IUserRepository userRepository;

    // @Override
    // public UserDetails loadUserByUsername(String email) throws
    // UsernameNotFoundException {
    // User user = userRepository.findByEmail(email)
    // .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng
    // với email: "));
    // return new CustomerUserDetails(user);
    // }

    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        // THAY ĐỔI: Chấp nhận cả username hoặc email để đăng nhập, nhưng luôn tìm ra
        // một User duy nhất
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail,
                usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User Not Found with username or email: " + usernameOrEmail));

        // QUAN TRỌNG: Luôn trả về user.getUsername() làm định danh chính cho Spring
        // Security
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), // <--- LUÔN LÀ USERNAME
                user.getPassword(),
                java.util.Collections
                        .singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                "ROLE_" + user.getRole().name())));
    }

}
