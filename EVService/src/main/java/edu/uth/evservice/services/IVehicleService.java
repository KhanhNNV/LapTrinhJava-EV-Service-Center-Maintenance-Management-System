package edu.uth.evservice.services;

import edu.uth.evservice.dtos.VehicleDto;
import edu.uth.evservice.requests.VehicleRequest;
import java.util.List;

public interface IVehicleService {
    // Đăng ký
    VehicleDto registerVehicle(VehicleRequest request, String customerUsername);
    
    // Lấy danh sách xe CỦA TÔI (customer)
    List<VehicleDto> getMyVehicles(String customerUsername);

    // Lấy chi tiết 1 xe CỦA TÔI (customer)
    VehicleDto getMyVehicleById(Integer vehicleId, String customerUsername);

    // Cập nhật 1 xe CỦA TÔI (customer)
    VehicleDto updateMyVehicle(Integer vehicleId, VehicleRequest request, String customerUsername);

    // Xóa 1 xe CỦA TÔI (customer)
    void deleteMyVehicle(Integer vehicleId, String customerUsername);
}
