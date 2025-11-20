package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.ProfitReportDto;
import edu.uth.evservice.dtos.SalaryDto;
import edu.uth.evservice.dtos.UserDto;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.requests.CreateUserRequest;
import edu.uth.evservice.requests.UpdateBaseSalaryByRoleRequest;
import edu.uth.evservice.requests.UpdateBaseSalaryRequest;
import edu.uth.evservice.services.IProfitReportService;
import edu.uth.evservice.services.ISalaryService;
import edu.uth.evservice.services.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final ISalaryService salaryService;
    private final IProfitReportService profitReportService;
    // Tìm kiếm user theo username hoặc fullname (chữ thường)
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false, name = "fullname") String fullName) {
        return ResponseEntity.ok(userService.searchUsers(username, fullName));
    }

    // Lấy tất cả user theo role
    @GetMapping("/role/{role:[a-zA-Z]+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase()); //Chuyển sang Enum
            return ResponseEntity.ok(userService.getUsersByRole(userRole));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Role không hợp lệ: " + role);
        }
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
    //In danh sách lương của tất cả nhân viên trong một tháng


    @GetMapping("/calculate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalaryDto>> calculateSalaries(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return ResponseEntity.ok(salaryService.calculateMonthlySalaries(month));
    }
    //Báo cáo lợi nhuận trong 1 tháng
    @GetMapping("/profit")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfitReportDto getMonthlyProfit(@RequestParam int year, @RequestParam int month) {
        return profitReportService.getMonthlyProfitReport(year, month);
    }

    //Lấy thông tin của cá nhân
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> updateMyProfile(Authentication authentication) {
        
        Integer userId = Integer.parseInt(authentication.getName());
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> updateMyProfile(@RequestBody CreateUserRequest request, Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserDto>> getUserByRole(
        @RequestParam(name= "role") Role role,
        @RequestParam(name= "page", defaultValue = "0") int page,
        @RequestParam(name= "limit",defaultValue = "10") int limit
    ){
        Page<UserDto> result = userService.getListUsersByRole(role, page, limit);
        return ResponseEntity.ok(result);
    }
    // --- BỔ SUNG: Endpoint cập nhật lương TỪNG NGƯỜI ---
    // Tương ứng với PUT /api/users/{userId}/base-salary trên Frontend
    @PutMapping("/{userId}/base-salary")
    public ResponseEntity<User> updateBaseSalary(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateBaseSalaryRequest request) {

        User updatedUser = salaryService.updateBaseSalary(userId, request);
        return ResponseEntity.ok(updatedUser);
    }

    // --- BỔ SUNG: Endpoint cập nhật lương CHUNG THEO ROLE ---
    // Tương ứng với PUT /api/users/update-base-salary-by-role trên Frontend
    @PutMapping("/update-base-salary-by-role")
    public ResponseEntity<List<User>> updateBaseSalaryByRole(
            @Valid @RequestBody UpdateBaseSalaryByRoleRequest request) {

        List<User> updatedUsers = salaryService.updateBaseSalaryByRole(request);
        return ResponseEntity.ok(updatedUsers);
    }

}
