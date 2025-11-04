package edu.uth.evservice.services;

import edu.uth.evservice.dtos.VehicleDto;
import edu.uth.evservice.requests.VehicleRequest;
import java.util.List;

public interface IVehicleService {
    List<VehicleDto> getAllVehicles();
    VehicleDto getVehicleById(Integer id);
    List<VehicleDto> getVehiclesByUser(Integer userId);
    // VehicleDto createVehicle(VehicleRequest request);
    VehicleDto updateVehicle(Integer id, VehicleRequest request);
    void deleteVehicle(Integer id);
    // Bất kỳ lớp nào implement interface này đều phải cung cấp logic cho việc đăng ký xe.
    VehicleDto registerVehicle(VehicleRequest request, String customerUsername);
}
