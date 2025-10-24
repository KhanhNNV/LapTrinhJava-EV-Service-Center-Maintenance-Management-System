package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.VehicleDto;
import edu.uth.evservice.EVService.requests.UpdateVehicleRequest;
import edu.uth.evservice.EVService.services.IVehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final IVehicleService vehicleService;

    // Endpoint để cập nhật thông tin xe
    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(@PathVariable Integer id, @RequestBody UpdateVehicleRequest request) {
        VehicleDto updatedVehicle = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(updatedVehicle);
    }
}