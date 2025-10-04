package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.model.Vehicle;
import edu.uth.evservice.EVService.services.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicle));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Integer id) {
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByCustomer(@PathVariable Integer customerId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByCustomer(customerId));
    }

    @GetMapping("/center/{centerId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByServiceCenter(@PathVariable Integer centerId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByServiceCenter(centerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Integer id, @RequestBody Vehicle updatedVehicle) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, updatedVehicle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
