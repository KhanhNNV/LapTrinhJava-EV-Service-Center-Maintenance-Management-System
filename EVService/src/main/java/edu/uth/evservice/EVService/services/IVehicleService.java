package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.VehicleRequest;
import java.util.List;

public interface IVehicleService {
    List<VehicleDto> getAllVehicles();
    VehicleDto getVehicleById(Integer id);
    List<VehicleDto> getVehiclesByUser(Integer userId);
    VehicleDto createVehicle(VehicleRequest request);
    VehicleDto updateVehicle(Integer id, VehicleRequest request);
    void deleteVehicle(Integer id);
}
