package edu.uth.evservice.EVService.services;

import java.util.List;
import java.util.Optional;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.requests.CreateUserRequest;

public interface IUserService {
    UserDto createUser(CreateUserRequest request);

    UserDto getUserById(Integer id);

    List<UserDto> getAllUsers();

    UserDto updateUser(Integer id, CreateUserRequest request);

    void deleteUser(Integer id);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<UserDto> getUsersByRole(Role role); // Phân role user sử dụng cho crud admincontroller

}
