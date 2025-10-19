package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.requests.CreateUserRequest;

import java.util.List;

public interface IUserService {
    UserDto createUser(CreateUserRequest request);
    UserDto getUserById(Integer id);
    List<UserDto> getAllUsers();
    UserDto updateUser(Integer id, CreateUserRequest request);
    void deleteUser(Integer id);
}
