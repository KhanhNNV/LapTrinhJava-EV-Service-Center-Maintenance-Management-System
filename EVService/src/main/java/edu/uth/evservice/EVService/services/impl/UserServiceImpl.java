package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.EmployeePerformanceDto;
import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.repositories.IAppointmentRepository;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.services.IUserService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@AllArgsConstructor
public class UserServiceImpl implements IUserService {
    IUserRepository userRepository;
    IAppointmentRepository appointmentRepository;
    @Override
    public UserDto createUser(CreateUserRequest request) {
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role không hợp lệ: " + request.getRole());
        }

        if (userRepository.existsByUsername(request.getUsername()))
            throw new RuntimeException("Username đã tồn tại");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email đã tồn tại");


        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .role(role)
                .build();

        userRepository.save(user);
        return mapToDto(user);
    }

    @Override
    public UserDto getUserById(Integer id) {
        return userRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto updateUser(Integer id, CreateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (request.getRole() != null) {
            try {
                user.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Role không hợp lệ: " + request.getRole());
            }
        }

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());

        return mapToDto(userRepository.save(user));
    }

    @Override
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole())
                .build();
    }
    @Override
    public List<EmployeePerformanceDto> getEmployeePerformanceReport() {
        List<Object[]> results = appointmentRepository.getEmployeePerformanceReport();

        return results.stream().map(r -> {
            Integer staffId = (Integer) r[0];
            String staffName = (String) r[1];
            Long total = (Long) r[2];
            Long completed = (Long) r[3];
            Long pending = (Long) r[4];

            double completionRate = (total != 0) ? (completed * 100.0 / total) : 0.0;

            return EmployeePerformanceDto.builder()
                    .staffId(staffId)
                    .staffName(staffName)
                    .totalAppointments(total)
                    .completedAppointments(completed)
                    .pendingAppointments(pending)
                    .completionRate(completionRate)
                    .build();
        }).collect(Collectors.toList());
    }
}
