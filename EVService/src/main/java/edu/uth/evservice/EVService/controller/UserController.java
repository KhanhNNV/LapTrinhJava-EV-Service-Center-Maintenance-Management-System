package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.UserDto;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.services.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    // === ENDPOINT MỚI ĐỂ TẠO TÀI KHOẢN NHÂN VIÊN/ADMIN ===
    @PostMapping
    // Chỉ ADMIN hoặc STAFF mới có quyền gọi endpoint này
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest request) {
        UserDto newUser = userService.createUser(request);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }
}