package edu.uth.evservice.repositories;

import java.util.List;
import java.util.Optional;

import edu.uth.evservice.models.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.User;

@Repository
public interface IUserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameOrEmail(String username, String email);

    // . Đăng nhập bằng email, tìm kiếm không bị trùng email
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
    boolean existsByPhoneNumber(String phoneNumber);
    List<User> findByRole(Role role);// Phân role user sử dụng cho crud admincontroller
    //Tìm kiếm bằng username hoặc fullname
    List<User> findByUsernameContainingIgnoreCase(String username);

    List<User> findByFullNameContainingIgnoreCase(String fullName);

    List<User> findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(String username, String fullName);

}
