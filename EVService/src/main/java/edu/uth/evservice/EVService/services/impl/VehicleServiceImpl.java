package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.model.ServiceCenter;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.Vehicle;
import edu.uth.evservice.EVService.repositories.IVehicleRepository;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.repositories.IServiceCenterRepository;
import edu.uth.evservice.EVService.requests.VehicleRequest;
import edu.uth.evservice.EVService.services.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements IVehicleService {

    private final IVehicleRepository vehicleRepository;
    private final IUserRepository userRepository;
    private final IServiceCenterRepository serviceCenterRepository;

    @Override
    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleDto getVehicleById(Integer id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        return toDTO(vehicle);
    }

    @Override
    public List<VehicleDto> getVehiclesByUser(Integer userId) {
        return vehicleRepository.findByUser_UserId(userId)
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    // @Override
    // public VehicleDto createVehicle(VehicleRequest request) {
    //     User user = userRepository.findById(request.getUserId())
    //             .orElseThrow(() -> new RuntimeException("User not found"));

    //     ServiceCenter center = serviceCenterRepository.findById(request.getCenterId())
    //             .orElseThrow(() -> new RuntimeException("Service center not found"));

    //     Vehicle vehicle = Vehicle.builder()
    //             .model(request.getModel())
    //             .brand(request.getBrand())
    //             .licensePlate(request.getLicensePlate())
    //             .recentMaintenanceDate(request.getRecentMaintenanceDate())
    //             .user(user)
    //             .serviceCenter(center)
    //             .build();

    //     return toDTO(vehicleRepository.save(vehicle));
    // }

    @Override
    public VehicleDto updateVehicle(Integer id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setRecentMaintenanceDate(request.getRecentMaintenanceDate());

        return toDTO(vehicleRepository.save(vehicle));
    }

    @Override
    public void deleteVehicle(Integer id) {
        vehicleRepository.deleteById(id);
    }

    // START: Thêm logic cho phương thức đăng ký xe của customer
    // Lý do: Đây là phương thức an toàn để khách hàng tự đăng ký xe của mình.
    // Công dụng:
    // 1. Sử dụng `customerUsername` lấy từ token (đã được xác thực) để xác định chủ xe, thay vì `userId` từ request.
    // 2. Kiểm tra xem biển số xe đã tồn tại trong hệ thống hay chưa.
    // 3. Xử lý logic gán xe cho một trung tâm dịch vụ nếu có.
    // 4. Lưu xe vào CSDL và trả về thông tin chi tiết (DTO).
    @Override
    public VehicleDto registerVehicle(VehicleRequest request, String customerUsername) {
        // 1. Tìm customer bằng username (an toàn hơn)
        User customer = userRepository.findByUsername(customerUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + customerUsername));

        // 2. Kiểm tra biển số xe đã tồn tại
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new IllegalStateException("Biển số xe " + request.getLicensePlate() + " đã tồn tại.");
        }

        // 3. Tìm ServiceCenter (tái sử dụng logic từ hàm createVehicle cũ của bạn)
        // Nếu việc đăng ký xe không cần gán trung tâm ngay, bạn có thể bỏ phần này.
        ServiceCenter center = null;
        if (request.getCenterId() != null) {
            center = serviceCenterRepository.findById(request.getCenterId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy trung tâm dịch vụ"));
        }

        // 4. Tạo đối tượng Vehicle
        Vehicle vehicle = Vehicle.builder()
                .model(request.getModel())
                .brand(request.getBrand())
                .licensePlate(request.getLicensePlate())
                .recentMaintenanceDate(request.getRecentMaintenanceDate())
                .user(customer) // Gán chủ xe là người đang đăng nhập
                .serviceCenter(center) // Gán trung tâm dịch vụ
                .build();

        // 5. Lưu và chuyển đổi sang DTO bằng hàm có sẵn
        return toDTO(vehicleRepository.save(vehicle));
    }
    // END: Thêm logic cho phương thức đăng ký xe của customer

    private VehicleDto toDTO(Vehicle vehicle) {
        return VehicleDto.builder()
                .vehicleId(vehicle.getVehicleId())
                .model(vehicle.getModel())
                .brand(vehicle.getBrand())
                .licensePlate(vehicle.getLicensePlate())
                .recentMaintenanceDate(vehicle.getRecentMaintenanceDate())
                .userId(vehicle.getUser() != null ? vehicle.getUser().getUserId() : null)
                .centerId(vehicle.getServiceCenter() != null ? vehicle.getServiceCenter().getCenterId() : null)
                .build();
    }

    
}
