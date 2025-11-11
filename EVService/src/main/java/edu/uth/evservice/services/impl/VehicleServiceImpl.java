package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.VehicleDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.ServiceCenter;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.Vehicle;
import edu.uth.evservice.repositories.IVehicleRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.repositories.IServiceCenterRepository;
import edu.uth.evservice.requests.VehicleRequest;
import edu.uth.evservice.services.IVehicleService;
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

    // START: Thêm logic cho phương thức đăng ký xe của customer
    // Lý do: Đây là phương thức an toàn để khách hàng tự đăng ký xe của mình.
    // Công dụng:
    // 1. Sử dụng `customerId` lấy từ token (đã được xác thực) để xác định chủ xe, thay vì `userId` từ request.
    // 2. Kiểm tra xem biển số xe đã tồn tại trong hệ thống hay chưa.
    // 3. Xử lý logic gán xe cho một trung tâm dịch vụ nếu có.
    // 4. Lưu xe vào CSDL và trả về thông tin chi tiết (DTO).
    @Override
    public VehicleDto registerVehicle(VehicleRequest request, Integer customerId){
        // 1. Tìm customer bằng customerId (an toàn hơn)
        User customer = userRepository.findById(customerId) 
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + customerId));

        // 2. Kiểm tra biển số xe đã tồn tại
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new IllegalStateException("Biển số xe " + request.getLicensePlate() + " đã tồn tại.");
        }

        // 3. Tìm ServiceCenter (tái sử dụng logic từ hàm createVehicle cũ của bạn)
        // Nếu việc đăng ký xe không cần gán trung tâm ngay, bạn có thể bỏ phần này.
        ServiceCenter center = null;
        if (request.getCenterId() != null) {
            center = serviceCenterRepository.findById(request.getCenterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trung tâm dịch vụ"));
        }

        // 4. Tạo đối tượng Vehicle
        Vehicle vehicle = Vehicle.builder()
                .model(request.getModel())
                .brand(request.getBrand())
                .licensePlate(request.getLicensePlate())
                .recentMaintenanceDate(request.getRecentMaintenanceDate())
                .user(customer) // Gán chủ xe là người đang đăng nhập
                .serviceCenter(center) // Gán trung tâm dịch vụ
                .vehicleType(request.getVehicleType())
                .build();

        // 5. Lưu và chuyển đổi sang DTO bằng hàm có sẵn
        return toDTO(vehicleRepository.save(vehicle));
    }
    // END: Thêm logic cho phương thức đăng ký xe của customer
    @Override
    public List<VehicleDto> getMyVehicles(String customerUsername) {
        // Sử dụng repository để tìm tất cả xe của user đang đăng nhập
        return vehicleRepository.findByUser_Username(customerUsername)
                .stream()
                .map(this::toDTO) // Chuyển đổi từng xe sang DTO
                .collect(Collectors.toList());
    }

    @Override
    public VehicleDto getMyVehicleById(Integer vehicleId, String customerUsername) {
        // Tìm xe theo ID VÀ username để đảm bảo đúng chủ sở hữu
        Vehicle vehicle = vehicleRepository.findByVehicleIdAndUser_Username(vehicleId, customerUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe hoặc bạn không có quyền truy cập xe này."));
        
        return toDTO(vehicle);
    }

    @Override
    public VehicleDto updateMyVehicle(Integer vehicleId, VehicleRequest request, String customerUsername) {
        // 1. Tìm xe và xác thực chủ sở hữu
        Vehicle existingVehicle = vehicleRepository.findByVehicleIdAndUser_Username(vehicleId, customerUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe hoặc bạn không có quyền sửa xe này."));

        // 2. Cập nhật thông tin (chỉ những gì customer được phép sửa)
        existingVehicle.setModel(request.getModel());
        existingVehicle.setBrand(request.getBrand());
        existingVehicle.setLicensePlate(request.getLicensePlate());
        existingVehicle.setRecentMaintenanceDate(request.getRecentMaintenanceDate());
        existingVehicle.setVehicleType(request.getVehicleType());
        
        // 3. Lưu lại
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);
        return toDTO(updatedVehicle);
    }

    @Override
    public void deleteMyVehicle(Integer vehicleId, String customerUsername) {
        // 1. Tìm xe và xác thực chủ sở hữu
        Vehicle vehicle = vehicleRepository.findByVehicleIdAndUser_Username(vehicleId, customerUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe hoặc bạn không có quyền xóa xe này."));

        // 2. Xóa xe
        vehicleRepository.delete(vehicle);
    }


    private VehicleDto toDTO(Vehicle vehicle) {
        return VehicleDto.builder()
                .vehicleId(vehicle.getVehicleId())
                .model(vehicle.getModel())
                .brand(vehicle.getBrand())
                .licensePlate(vehicle.getLicensePlate())
                .recentMaintenanceDate(vehicle.getRecentMaintenanceDate())
                .userId(vehicle.getUser() != null ? vehicle.getUser().getUserId() : null)
                .centerId(vehicle.getServiceCenter() != null ? vehicle.getServiceCenter().getCenterId() : null)
                .vehicleType(vehicle.getVehicleType())
                .build();
    }

    
}
