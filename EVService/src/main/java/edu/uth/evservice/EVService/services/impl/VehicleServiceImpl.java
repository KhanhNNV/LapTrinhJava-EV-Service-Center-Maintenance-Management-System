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

    @Override
    public VehicleDto createVehicle(VehicleRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceCenter center = serviceCenterRepository.findById(request.getCenterId())
                .orElseThrow(() -> new RuntimeException("Service center not found"));

        Vehicle vehicle = Vehicle.builder()
                .model(request.getModel())
                .brand(request.getBrand())
                .licensePlate(request.getLicensePlate())
                .recentMaintenanceDate(request.getRecentMaintenanceDate())
                .user(user)
                .serviceCenter(center)
                .build();

        return toDTO(vehicleRepository.save(vehicle));
    }

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
