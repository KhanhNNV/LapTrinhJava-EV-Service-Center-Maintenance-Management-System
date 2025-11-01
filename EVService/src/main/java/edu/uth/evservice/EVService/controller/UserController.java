package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.*;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.services.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    // Lấy tất cả user theo role
    @GetMapping("/admin/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Tìm user theo ID
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Cập nhật user theo ID
    @PutMapping("/admin/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Integer id,
                                        @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // Xóa user theo ID
    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Đã xóa user có ID = " + id);
    }

    // Tạo Technician
    @PostMapping("/admin/technician/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTechnician(@RequestBody CreateUserRequest request) {
        request.setRole(Role.TECHNICIAN.name());
        return ResponseEntity.ok(userService.createUser(request));
    }

    // Tạo Staff
    @PostMapping("/admin/staff/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createStaff(@RequestBody CreateUserRequest request) {
        request.setRole(Role.STAFF.name());
        return ResponseEntity.ok(userService.createUser(request));
    }
}
