package edu.uth.evservice.services;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;

import edu.uth.evservice.dtos.UserDto;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.requests.CreateUserRequest;

public interface IUserService {

    UserDto createUser(CreateUserRequest request);

    UserDto getUserById(Integer id);

    List<UserDto> getAllUsers();

    UserDto updateUser(Integer id, CreateUserRequest request);

    void deleteUser(Integer id);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<UserDto> getUsersByRole(Role role); // Phân role user sử dụng cho crud Admin

    List<UserDto> searchUsers(String username, String fullName);// Tìm kiếm user bằng username hoặc fullname

    Page<UserDto> getListUsersByRole(Role role, int pages, int limit );
}
