package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.services.IUserService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@AllArgsConstructor
public class UserServiceImpl implements IUserService {
    IUserRepository userRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Integer id) {
        return userRepository.findById(id.intValue())
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public UserDto createUser(CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);
        return toDto(saved);
    }

    @Override
    public UserDto updateUser(Integer id, CreateUserRequest request) {
        return userRepository.findById(id.intValue())
                .map(existing -> {
                    existing.setFullName(request.getFullName());
                    existing.setUsername(request.getUsername());
                    existing.setEmail(request.getEmail());
                    existing.setPhoneNumber(request.getPhoneNumber());
                    existing.setAddress(request.getAddress());
                    if (request.getPassword() != null && !request.getPassword().isBlank()) {
                        existing.setPassword(passwordEncoder.encode(request.getPassword()));
                    }
                    User updated = userRepository.save(existing);
                    return toDto(updated);
                })
                .orElse(null);
    }

    @Override
    public void deleteUser(Integer id) {
        userRepository.deleteById(id.intValue());
    }

    private UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getUserId().intValue());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        return dto;
    }
}
