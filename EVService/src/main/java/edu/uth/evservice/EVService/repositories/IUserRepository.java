package edu.uth.evservice.EVService.repositories;
import edu.uth.evservice.EVService.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<User,Integer> {
    Optional<User> findByUsername(String username);
    //. Đăng nhập bằng email, tìm kiếm không bị trùng email
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
