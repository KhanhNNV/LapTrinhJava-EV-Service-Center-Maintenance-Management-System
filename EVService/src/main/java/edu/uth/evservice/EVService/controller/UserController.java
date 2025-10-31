package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.*;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.services.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    // Lấy tất cả user theo role
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    // Tìm user theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Cập nhật user theo ID
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id,
                                        @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // Xóa user theo ID
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Đã xóa user có ID = " + id);
    }


    // TECHNICIAN
    //In ra danh sách Technician
    @GetMapping("/technicians/read")
    public ResponseEntity<?> getAllTechnicians() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.TECHNICIAN));
    }
    //Tạo Technician
    @PostMapping("/technicians/create")
    public ResponseEntity<?> createTechnician(@RequestBody CreateUserRequest request) {
        request.setRole(Role.TECHNICIAN.name());
        return ResponseEntity.ok(userService.createUser(request));
    }

    // STAFF
    //In ra danh sách Staff
    @GetMapping("/staff/read")
    public ResponseEntity<?> getAllStaff() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.STAFF));
    }
    //Tạo Staff
    @PostMapping("/staff/create")
    public ResponseEntity<?> createStaff(@RequestBody CreateUserRequest request) {
        request.setRole(Role.STAFF.name());
        return ResponseEntity.ok(userService.createUser(request));
    }

    // CUSTOMER
    //In ra danh sách Customer
    @GetMapping("/customers/read")
    public ResponseEntity<?> getAllCustomers() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.CUSTOMER));
    }
}
