package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.requests.UpdateUserRequest;

import java.util.List;

public interface IUserService {
    UserDto createUser(CreateUserRequest request);
    UserDto getUserById(Integer id);
    List<UserDto> getAllUsers();
    UserDto updateUser(Integer id, UpdateUserRequest request);
    //CreateUserRequest có thể chứa các trường nhạy cảm như username hoặc password 
    void deleteUser(Integer id);
}
