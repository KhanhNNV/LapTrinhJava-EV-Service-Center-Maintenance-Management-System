package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.VehicleRequest;

import java.util.List;
import java.util.Optional;

public interface IVehicleService {

    VehicleDto createVehicle(VehicleRequest request);

    Optional<VehicleDto> getVehicleById(Integer id);

    List<VehicleDto> getVehiclesByCustomer(Integer customerId);

    List<VehicleDto> getVehiclesByServiceCenter(Integer centerId);

    VehicleDto updateVehicle(Integer id, VehicleRequest request);

    void deleteVehicle(Integer id);
}
