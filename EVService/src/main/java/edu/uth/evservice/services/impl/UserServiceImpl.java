package edu.uth.evservice.services.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.uth.evservice.dtos.UserDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.ServiceCenter;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.repositories.IServiceCenterRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.CreateUserRequest;
import edu.uth.evservice.services.IUserService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class UserServiceImpl implements IUserService {

    IUserRepository userRepository;
    PasswordEncoder passwordEncoder;
    IServiceCenterRepository serviceCenterRepository;

    @Override
    public UserDto createUser(CreateUserRequest request) {
        // Kiểm tra role hợp lệ
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Role không hợp lệ: " + request.getRole());
        }

        // Kiểm tra trùng username/email
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalStateException("Username đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email đã tồn tại");
        }

        // Kiểm tra mật khẩu
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Mật khẩu không được để trống");
        }

        // Kiểm tra centerId (chỉ với Staff và Technician)
        ServiceCenter center = null;
        if (role == Role.STAFF || role == Role.TECHNICIAN) {
            if (request.getCenterId() == null) {
                throw new IllegalArgumentException("Staff và Technician bắt buộc phải có centerId.");
            }
            center = serviceCenterRepository.findById(request.getCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy Service Center với ID: " + request.getCenterId()));
        }

        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(role)
                .serviceCenter(center)
                .build();

        userRepository.save(user);
        return mapToDto(user);
    }

    @Override
    public UserDto getUserById(Integer id) {
        return userRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));
    }

    @Override
    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            throw new ResourceNotFoundException("Không có người dùng nào trong hệ thống");
        }
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto updateUser(Integer id, CreateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với ID: " + id));

        // Cập nhật role nếu có
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Role không hợp lệ: " + request.getRole());
            }
        }

        // Username
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (!request.getUsername().equals(user.getUsername()) &&
                    userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalStateException("Username đã tồn tại: " + request.getUsername());
            }
            user.setUsername(request.getUsername());
        }

        // Email
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail()) &&
                    userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalStateException("Email đã tồn tại: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        // Phone
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            if (!request.getPhoneNumber().equals(user.getPhoneNumber()) &&
                    userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new IllegalStateException("Số điện thoại đã tồn tại: " + request.getPhoneNumber());
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }

        // Thông tin khác
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }

        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            user.setAddress(request.getAddress());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Cập nhật center nếu có
        if (request.getCenterId() != null) {
            ServiceCenter center = serviceCenterRepository.findById(request.getCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy Service Center với ID: " + request.getCenterId()));
            user.setServiceCenter(center);
        }

        return mapToDto(userRepository.save(user));
    }

    @Override
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không thể xóa — người dùng không tồn tại với ID: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<UserDto> getUsersByRole(Role role) {
        List<User> users = userRepository.findByRole(role);
        if (users.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng nào với vai trò: " + role);
        }
        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> searchUsers(String username, String fullName) {
        List<User> users;

        if (username != null && !username.isEmpty() && fullName != null && !fullName.isEmpty()) {
            users = userRepository.findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(username, fullName);
        } else if (username != null && !username.isEmpty()) {
            users = userRepository.findByUsernameContainingIgnoreCase(username);
        } else if (fullName != null && !fullName.isEmpty()) {
            users = userRepository.findByFullNameContainingIgnoreCase(fullName);
        } else {
            users = userRepository.findAll();
        }

        if (users.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng phù hợp với tiêu chí tìm kiếm.");
        }

        return users.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber() != null ? user.getPhoneNumber() : null)
                .address(user.getAddress() != null ? user.getAddress() : null)
                .role(user.getRole().name())
                .build();
    }
}
