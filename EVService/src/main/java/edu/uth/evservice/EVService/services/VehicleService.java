package edu.uth.evservice.EVService.services;
import edu.uth.evservice.EVService.model.Vehicle;
import java.util.List;
import java.util.Optional;

public interface VehicleService {

    Vehicle createVehicle(Vehicle vehicle);

    Optional<Vehicle> getVehicleById(Integer id);

    List<Vehicle> getVehiclesByCustomer(Integer customerId);

    List<Vehicle> getVehiclesByServiceCenter(Integer centerId);

    Vehicle updateVehicle(Integer id, Vehicle updatedVehicle);

    void deleteVehicle(Integer id);
}
