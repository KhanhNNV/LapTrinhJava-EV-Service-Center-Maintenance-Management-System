package edu.uth.evservice.controllers;

import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.requests.CreateUserRequest;
import edu.uth.evservice.services.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    // Tìm kiếm user theo username hoặc fullName
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> searchUsers(@RequestParam(required = false) String username,
                                         @RequestParam(required = false) String fullName) {
        return ResponseEntity.ok(userService.searchUsers(username, fullName));
    }

    // Lấy tất cả user theo role
    @GetMapping("/{role:[a-zA-Z]+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Tìm user theo ID
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Cập nhật user theo ID
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Integer id,
                                        @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // Xóa user theo ID
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Đã xóa user có ID = " + id);
    }

    // Tạo Technician
    @PostMapping("/createTechnician")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTechnician(@RequestBody CreateUserRequest request) {
        request.setRole(Role.TECHNICIAN.name());
        return ResponseEntity.ok(userService.createUser(request));
    }

    // Tạo Staff
    @PostMapping("/createStaff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createStaff(@RequestBody CreateUserRequest request) {
        request.setRole(Role.STAFF.name());
        return ResponseEntity.ok(userService.createUser(request));
    }
}
