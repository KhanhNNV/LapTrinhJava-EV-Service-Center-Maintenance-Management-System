package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.VehicleRequest;
import edu.uth.evservice.EVService.mapper.VehicleMapper;
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

    @Override
    public VehicleDto createVehicle(VehicleRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        ServiceCenter center = serviceCenterRepository.findById(request.getServiceCenterId())
                .orElseThrow(() -> new RuntimeException("Service center not found"));

        Vehicle vehicle = VehicleMapper.toEntity(request, customer, center);
        return VehicleMapper.toDto(vehicleRepository.save(vehicle));
    }

    @Override
    public Optional<VehicleDto> getVehicleById(Integer id) {
        return vehicleRepository.findById(id)
                .map(VehicleMapper::toDto);
    }

    @Override
    public List<VehicleDto> getVehiclesByCustomer(Integer customerId) {
        return vehicleRepository.findByCustomer_CustomerId(customerId)
                .stream()
                .map(VehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDto> getVehiclesByServiceCenter(Integer centerId) {
        return vehicleRepository.findByServiceCenter_CenterId(centerId)
                .stream()
                .map(VehicleMapper::toDto)
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

        return VehicleMapper.toDto(vehicleRepository.save(vehicle));
    }

    @Override
    public void deleteVehicle(Integer id) {
        vehicleRepository.deleteById(id);
    }
}
