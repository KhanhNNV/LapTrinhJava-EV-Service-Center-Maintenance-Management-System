package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.VehicleRequest;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.ServiceCenter;
import edu.uth.evservice.EVService.model.Vehicle;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.repositories.IServiceCenterRepository;
import edu.uth.evservice.EVService.repositories.IVehicleRepository;
import edu.uth.evservice.EVService.services.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements IVehicleService {

    private final IVehicleRepository vehicleRepository;
    private final IUserRepository userRepository;
    private final IServiceCenterRepository serviceCenterRepository;

    // --- Helper function: Convert Entity → DTO ---
    private VehicleDto toDto(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setVehicleId(vehicle.getVehicleId());
        dto.setModel(vehicle.getModel());
        dto.setBrand(vehicle.getBrand());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setRecentMaintenanceDate(vehicle.getRecentMaintenanceDate());

        // Lấy thông tin chủ sở hữu (User)
        if (vehicle.getUser() != null) {
            dto.setCustomerId(vehicle.getUser().getUserId());
            dto.setCustomerName(vehicle.getUser().getFullName());
        }

        // Lấy thông tin trung tâm dịch vụ
        if (vehicle.getServiceCenter() != null) {
            dto.setServiceCenterId(vehicle.getServiceCenter().getCenterId());
            dto.setServiceCenterName(vehicle.getServiceCenter().getCenterName());
        }

        return dto;
    }

    // --- Helper function: Convert Request → Entity ---
    private Vehicle toEntity(VehicleRequest request, User user, ServiceCenter center) {
        Vehicle vehicle = new Vehicle();
        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setRecentMaintenanceDate(request.getRecentMaintenanceDate());
        vehicle.setUser(user);
        vehicle.setServiceCenter(center);
        return vehicle;
    }

    @Override
    public VehicleDto createVehicle(VehicleRequest request) {
        User user = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceCenter center = serviceCenterRepository.findById(request.getServiceCenterId())
                .orElseThrow(() -> new RuntimeException("Service center not found"));

        Vehicle vehicle = toEntity(request, user, center);
        vehicleRepository.save(vehicle);

        return toDto(vehicle);
    }

    @Override
    public Optional<VehicleDto> getVehicleById(Integer id) {
        return vehicleRepository.findById(id).map(this::toDto);
    }

    @Override
    public List<VehicleDto> getVehiclesByCustomer(Integer userId) {
        return vehicleRepository.findByUser_UserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDto> getVehiclesByServiceCenter(Integer centerId) {
        return vehicleRepository.findByServiceCenter_CenterId(centerId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleDto updateVehicle(Integer id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        User user = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceCenter center = serviceCenterRepository.findById(request.getServiceCenterId())
                .orElseThrow(() -> new RuntimeException("Service center not found"));

        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setRecentMaintenanceDate(request.getRecentMaintenanceDate());
        vehicle.setUser(user);
        vehicle.setServiceCenter(center);

        vehicleRepository.save(vehicle);
        return toDto(vehicle);
    }

    @Override
    public void deleteVehicle(Integer id) {
        vehicleRepository.deleteById(id);
    }
}
