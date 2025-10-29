package edu.uth.evservice.EVService.services;

import java.util.List;
import java.util.Optional;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.requests.CreateUserRequest;

public interface IUserService {
    UserDto createUser(CreateUserRequest request);

    UserDto getUserById(Integer id);

    List<UserDto> getAllUsers();

    UserDto updateUser(Integer id, CreateUserRequest request);

    void deleteUser(Integer id);

    /**
     * Tìm kiếm một User entity dựa trên username.
     * Trả về Optional<User> để xử lý trường hợp không tìm thấy một cách an toàn.
     * 
     * @param username Tên đăng nhập cần tìm.
     * @return Optional chứa User nếu tìm thấy, ngược lại là Optional rỗng.
     */
    Optional<User> findByUsername(String username);
}
