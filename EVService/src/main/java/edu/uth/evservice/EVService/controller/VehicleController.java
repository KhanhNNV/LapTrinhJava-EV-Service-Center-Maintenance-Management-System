package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.VehicleRequest;
import edu.uth.evservice.EVService.services.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleDto> createVehicle(@RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.createVehicle(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable Integer id) {
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<VehicleDto>> getVehiclesByCustomer(@PathVariable Integer customerId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByCustomer(customerId));
    }

    @GetMapping("/center/{centerId}")
    public ResponseEntity<List<VehicleDto>> getVehiclesByServiceCenter(@PathVariable Integer centerId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByServiceCenter(centerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(@PathVariable Integer id, @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
