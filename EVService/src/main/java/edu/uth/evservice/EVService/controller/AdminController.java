package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.*;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.services.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    // ======== 5.1 Quản lý hệ thống & cấu hình ========
    private final IUserService userService;
    // ========== 5.1.1 QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN ===========
    // ========== CRUD CHO TECHNICIAN ============================
    // Lấy danh sách tất cả technician
    @GetMapping("/technician/read")
    public ResponseEntity<?> getAllTechnicians() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.TECHNICIAN));
    }

    // Tìm technician theo ID
    @GetMapping("/technician/search/{id}")
    public ResponseEntity<?> getTechnicianById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Tạo technician mới
    @PostMapping("/technician/create")
    public ResponseEntity<?> createTechnician(@RequestBody CreateUserRequest request) {
        request.setRole(Role.TECHNICIAN.name());
        return ResponseEntity.ok(userService.createUser(request));
    }

    // Cập nhật thông tin technician
    @PutMapping("/technician/update/{id}")
    public ResponseEntity<?> updateTechnician(@PathVariable Integer id,
                                              @RequestBody CreateUserRequest request) {
        request.setRole(Role.TECHNICIAN.name());
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // Xóa technician
    @DeleteMapping("/technician/remove/{id}")
    public ResponseEntity<?> deleteTechnician(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Đã xóa technician có ID = " + id);
    }

    // ========== CRUD CHO STAFF ================================
    //In danh sách staff
    @GetMapping("/staff/read")
    public ResponseEntity<?> getAllStaff() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.STAFF));
    }
    //Tìm staff theo ID
    @GetMapping("/staff/search/{id}")
    public ResponseEntity<?> getStaffById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    //Tạo staff mới
    @PostMapping("/staff/create")
    public ResponseEntity<?> createStaff(@RequestBody CreateUserRequest request) {
        request.setRole(Role.STAFF.name());
        return ResponseEntity.ok(userService.createUser(request));
    }
    //Cập nhật thông tin staff
    @PutMapping("/staff/update/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable Integer id,
                                         @RequestBody CreateUserRequest request) {
        request.setRole(Role.STAFF.name());
        return ResponseEntity.ok(userService.updateUser(id, request));
    }
    //Xóa staff
    @DeleteMapping("/staff/remove/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Đã xóa staff có ID = " + id);
    }

    // ========== CRUD CHO CUSTOMER =============================
    //In danh sách customer
    @GetMapping("/customer/read")
    public ResponseEntity<?> getAllCustomers() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.CUSTOMER));
    }
    //Tìm customer theo ID
    @GetMapping("/customer/search/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    //Cập nhật thông tin customer
    @PutMapping("/customer/update/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Integer id,
                                            @RequestBody CreateUserRequest request) {
        request.setRole(Role.CUSTOMER.name());
        return ResponseEntity.ok(userService.updateUser(id, request));
    }
    //Xóa người dùng
    @DeleteMapping("/customer/remove/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Đã xóa customer có ID = " + id);
    }

}
