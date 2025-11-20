package edu.uth.evservice.services;

import edu.uth.evservice.dtos.VehicleDto;
import edu.uth.evservice.requests.VehicleRequest;
import java.util.List;

public interface IVehicleService {
    VehicleDto registerVehicle(VehicleRequest request, Integer customerId);
    // Đăng ký

    // Lấy danh sách xe CỦA TÔI (customer)
    List<VehicleDto> getMyVehicles(Integer UserId);

    // Lấy chi tiết 1 xe CỦA TÔI (customer)
    VehicleDto getMyVehicleById(Integer vehicleId, Integer UserId);

    // Cập nhật 1 xe CỦA TÔI (customer)
    VehicleDto updateMyVehicle(Integer vehicleId, VehicleRequest request, Integer UserId);

    // Xóa 1 xe CỦA TÔI (customer)
    void deleteMyVehicle(Integer vehicleId, Integer UserId);

    // lấy xe theo id cho phần quản lý
    VehicleDto getVehicleById(Integer vehicleId);
}
