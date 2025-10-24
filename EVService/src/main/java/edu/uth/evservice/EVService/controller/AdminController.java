package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.*;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.enums.Role;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.requests.CreateUserRequest;
import edu.uth.evservice.EVService.requests.LoginRequest;
import edu.uth.evservice.EVService.services.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminController {

    private final IUserService userService;
    private final IServiceCenterService serviceCenterService;
    private final IAppointmentService appointmentService;
    private final IVehicleService vehicleService;
    private final IInventoryService inventoryService;
    private final IInvoiceService invoiceService;
    private final IServiceItemService serviceItemService;
    private final IServicePackageService servicePackageService;
    private final IUserRepository userRepository;
    // ===============================
    // 5.1 QUẢN LÝ HỆ THỐNG & CẤU HÌNH
    // ===============================

    /**
     * 5.1.1 Quản lý tài khoản & phân quyền người dùng
     */
    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Integer id, @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 5.1.2 Cấu hình các loại dịch vụ, bảng giá và checklist EV
     * (placeholder – sẽ kết nối với ServiceTypeService sau)
     */
    @GetMapping("/config/services")
    public ResponseEntity<Map<String, Object>> getServiceConfigurations() {
        Map<String, Object> data = new HashMap<>();

        data.put("serviceItems", serviceItemService.getAllServiceItems());
        data.put("servicePackages", servicePackageService.getAllPackages());

        return ResponseEntity.ok(data);
    }

    /**
     * 5.1.3 Quản lý thông tin các trung tâm dịch vụ
     */
    @GetMapping("/config/centers")
    public ResponseEntity<List<ServiceCenterDto>> getServiceCenters() {
        List<ServiceCenterDto> centers = serviceCenterService.getAllServiceCenters();
        return ResponseEntity.ok(centers);
    }

    /**
     * (Tuỳ chọn) Lấy thông tin chi tiết một trung tâm dịch vụ
     */
    @GetMapping("/config/centers/{id}")
    public ResponseEntity<ServiceCenterDto> getCenterById(@PathVariable("id") int centerId) {
        ServiceCenterDto center = serviceCenterService.getServiceCenterById(centerId);
        return ResponseEntity.ok(center);
    }

    // ===============================
    // 5.2 QUẢN LÝ VẬN HÀNH & KINH DOANH
    // ===============================

    /**
     * 5.2.1 Giám sát & quản lý tổng thể hồ sơ khách hàng và xe
     */
    @GetMapping("/customers")
    public ResponseEntity<List<CustomerProfileDto>> getAllCustomerProfiles() {
        // 1️⃣ Lấy tất cả user có role = CUSTOMER
        List<UserDto> allUsers = userService.getAllUsers(); // hoặc repository.findByRole(Role.CUSTOMER)
        List<UserDto> customers = allUsers.stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .collect(Collectors.toList());

        // 2️⃣ Với mỗi khách hàng → lấy danh sách xe
        List<CustomerProfileDto> profiles = customers.stream()
                .map(u -> CustomerProfileDto.builder()
                        .userId(u.getUserId())
                        .fullName(u.getFullName())
                        .email(u.getEmail())
                        .phoneNumber(u.getPhoneNumber())
                        .address(u.getAddress())
                        .vehicles(vehicleService.getVehiclesByUser(u.getUserId()))
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(profiles);
    }

    /**
     * 5.2.2 Giám sát toàn bộ lịch hẹn và tiến độ dịch vụ của các xe
     */
    @GetMapping("/operations/appointments")
    public ResponseEntity<List<AppointmentDto>> getAllAppointmentsWithProgress() {
        List<AppointmentDto> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    /**
     * 5.2.3 Quản lý tổng thể danh mục phụ tùng & cấu hình mức tồn kho tối thiểu
     */
    @GetMapping("/operations/inventory")
    public ResponseEntity<?> getInventoryStatus() {
        List<InventoryDto> inventories = inventoryService.getAllInventories();

        // Phụ tùng nào đang dưới mức tồn kho tối thiểu
        List<InventoryDto> lowStock = inventories.stream()
                .filter(inv -> inv.getQuantity() < inv.getMinQuantity())
                .collect(Collectors.toList());

        // Thống kê tổng quan
        int totalItems = inventories.size();
        int lowStockCount = lowStock.size();

        String summary = String.format(
                "Tổng số danh mục phụ tùng: %d | Cảnh báo tồn kho thấp: %d",
                totalItems, lowStockCount
        );

        return ResponseEntity.ok().body(
                new java.util.HashMap<>() {{
                    put("summary", summary);
                    put("inventories", inventories);
                    put("lowStockItems", lowStock);
                }}
        );
    }

    // ===============================
    // 5.3 QUẢN LÝ NHÂN SỰ
    // ===============================

    /**
     * 5.3.1 Quản lý hồ sơ nhân sự (thông tin, vai trò, chuyên môn)
     */
    @GetMapping("/hr/employees")
    public ResponseEntity<?> getEmployeeProfiles() {
        // Lấy tất cả người dùng
        List<UserDto> allUsers = userService.getAllUsers();

        // Lọc ra những người có vai trò nhân sự (không bao gồm khách hàng)
        List<UserDto> employees = allUsers.stream()
                .filter(u -> u.getRole() != null &&
                        (u.getRole().name().equals("STAFF")
                                || u.getRole().name().equals("TECHNICIAN")
                                || u.getRole().name().equals("ADMIN")))
                .collect(Collectors.toList());

        // Thống kê theo từng vai trò
        Map<String, Long> roleSummary = employees.stream()
                .collect(Collectors.groupingBy(
                        u -> u.getRole().name(),
                        Collectors.counting()
                ));

        // Kết quả trả về
        Map<String, Object> result = new HashMap<>();
        result.put("totalEmployees", employees.size());
        result.put("roleSummary", roleSummary);
        result.put("employees", employees);

        return ResponseEntity.ok(result);
    }

    /**
     * 5.3.2 Xem báo cáo tổng quan về hiệu suất & thời gian làm việc của nhân viên
     */
    @GetMapping("/hr/reports/performance")
    public ResponseEntity<List<EmployeePerformanceDto>> getEmployeePerformance() {
        List<EmployeePerformanceDto> reports = userService.getEmployeePerformanceReport();
        return ResponseEntity.ok(reports);
    }

    // ===============================
    // 5.4 QUẢN LÝ TÀI CHÍNH & BÁO CÁO
    // ===============================

    /**
     * 5.4.1 Quản lý & theo dõi doanh thu, chi phí, lợi nhuận
     */
    @GetMapping("/finance/summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary() {
        return ResponseEntity.ok(invoiceService.getFinancialSummary());
    }

    /**
     * 5.4.2 Thống kê, phân tích dữ liệu (dịch vụ phổ biến, xu hướng)
     */
    @GetMapping("/finance/analytics")
    public ResponseEntity<Map<String, Object>> getAnalyticsReport() {
        return ResponseEntity.ok(invoiceService.getAnalyticsReport());
    }

    /**
     * 5.4.3 Xem & quản lý lịch sử hóa đơn, thanh toán
     */
    @GetMapping("/finance/invoices")
    public ResponseEntity<List<InvoiceDto>> getInvoices() {
        List<InvoiceDto> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(invoices);
    }


    // ===============================
    // 5.5 ĐĂNG NHẬP / ĐĂNG XUẤT
    // ===============================

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Sai tên đăng nhập hoặc mật khẩu"));

        // ⚠️ So sánh mật khẩu
        if (!request.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Sai tên đăng nhập hoặc mật khẩu");
        }

        // ✅ Nếu đúng, trả thông tin user (hoặc token)
        UserDto userDto = UserDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Đăng xuất thành công");
    }
}
