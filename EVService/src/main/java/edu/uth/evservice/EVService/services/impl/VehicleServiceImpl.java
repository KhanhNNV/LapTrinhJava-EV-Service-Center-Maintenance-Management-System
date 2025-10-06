package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.VehicleRequest;
import edu.uth.evservice.EVService.model.Customer;
import edu.uth.evservice.EVService.model.ServiceCenter;
import edu.uth.evservice.EVService.model.Vehicle;
import edu.uth.evservice.EVService.repositories.CustomerRepository;
import edu.uth.evservice.EVService.repositories.ServiceCenterRepository;
import edu.uth.evservice.EVService.repositories.VehicleRepository;
import edu.uth.evservice.EVService.services.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final ServiceCenterRepository serviceCenterRepository;

    // --- Helper function: Convert Entity → DTO ---
    private VehicleDto toDto(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setVehicleId(vehicle.getVehicleId());
        dto.setModel(vehicle.getModel());
        dto.setBrand(vehicle.getBrand());
        dto.setLicensePlate(vehicle.getLicensePlate());
        dto.setRecentMaintenanceDate(vehicle.getRecentMaintenanceDate());

        if (vehicle.getCustomer() != null) {
            dto.setCustomerId(vehicle.getCustomer().getCustomerId());
            dto.setCustomerName(vehicle.getCustomer().getFullName());
        }

        if (vehicle.getServiceCenter() != null) {
            dto.setServiceCenterId(vehicle.getServiceCenter().getCenterId());
            dto.setServiceCenterName(vehicle.getServiceCenter().getCenterName());
        }

        return dto;
    }

    // --- Helper function: Convert Request → Entity ---
    private Vehicle toEntity(VehicleRequest request, Customer customer, ServiceCenter center) {
        Vehicle vehicle = new Vehicle();
        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setRecentMaintenanceDate(request.getRecentMaintenanceDate());
        vehicle.setCustomer(customer);
        vehicle.setServiceCenter(center);
        return vehicle;
    }

    @Override
    public VehicleDto createVehicle(VehicleRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        ServiceCenter center = serviceCenterRepository.findById(request.getServiceCenterId())
                .orElseThrow(() -> new RuntimeException("Service center not found"));

        Vehicle vehicle = toEntity(request, customer, center);
        vehicleRepository.save(vehicle);

        return toDto(vehicle);
    }

    @Override
    public Optional<VehicleDto> getVehicleById(Integer id) {
        return vehicleRepository.findById(id).map(this::toDto);
    }

    @Override
    public List<VehicleDto> getVehiclesByCustomer(Integer customerId) {
        return vehicleRepository.findByCustomer_CustomerId(customerId)
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

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        ServiceCenter center = serviceCenterRepository.findById(request.getServiceCenterId())
                .orElseThrow(() -> new RuntimeException("Service center not found"));

        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setRecentMaintenanceDate(request.getRecentMaintenanceDate());
        vehicle.setCustomer(customer);
        vehicle.setServiceCenter(center);

        vehicleRepository.save(vehicle);
        return toDto(vehicle);
    }

    @Override
    public void deleteVehicle(Integer id) {
        vehicleRepository.deleteById(id);
    }
}
