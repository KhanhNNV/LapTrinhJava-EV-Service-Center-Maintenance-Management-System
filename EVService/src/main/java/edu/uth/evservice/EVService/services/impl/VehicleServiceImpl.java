package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.model.Vehicle;
import edu.uth.evservice.EVService.repositories.VehicleRepository;
import edu.uth.evservice.EVService.services.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Override
    public Optional<Vehicle> getVehicleById(Integer id) {
        return vehicleRepository.findById(id);
    }

    @Override
    public List<Vehicle> getVehiclesByCustomer(Integer customerId) {
        return vehicleRepository.findByCustomer_CustomerId(customerId);
    }

    @Override
    public List<Vehicle> getVehiclesByServiceCenter(Integer centerId) {
        return vehicleRepository.findByServiceCenter_CenterId(centerId);
    }

    @Override
    public Vehicle updateVehicle(Integer id, Vehicle updatedVehicle) {
        return vehicleRepository.findById(id)
                .map(vehicle -> {
                    vehicle.setModel(updatedVehicle.getModel());
                    vehicle.setBrand(updatedVehicle.getBrand());
                    vehicle.setLicensePlate(updatedVehicle.getLicensePlate());
                    vehicle.setRecentMaintenanceDate(updatedVehicle.getRecentMaintenanceDate());
                    vehicle.setServiceCenter(updatedVehicle.getServiceCenter());
                    vehicle.setCustomer(updatedVehicle.getCustomer());
                    return vehicleRepository.save(vehicle);
                })
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    @Override
    public void deleteVehicle(Integer id) {
        vehicleRepository.deleteById(id);
    }
}
