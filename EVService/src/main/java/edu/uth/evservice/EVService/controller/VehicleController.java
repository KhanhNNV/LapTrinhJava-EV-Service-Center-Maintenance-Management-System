package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.VehicleRequest;
import edu.uth.evservice.EVService.services.IVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vehicles")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class VehicleController {

    private final IVehicleService vehicleService;

    // START: Tạo API Endpoint đăng ký xe
    // Lý do: Cung cấp một đường dẫn API để client có thể gửi yêu cầu đăng ký xe.
    // Công dụng:
    // - Endpoint: POST /api/v1/vehicles
    // - Nhận dữ liệu xe từ body của request.
    // - Lấy username của người dùng đang đăng nhập từ context bảo mật.
    // - Gọi service để xử lý nghiệp vụ và trả về kết quả.
    @PostMapping
    public ResponseEntity<VehicleDto> registerVehicleForCustomer(@Valid @RequestBody VehicleRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Gọi phương thức mới, an toàn hơn
        VehicleDto createdVehicle = vehicleService.registerVehicle(request, username);

        return new ResponseEntity<>(createdVehicle, HttpStatus.CREATED);
    }
}