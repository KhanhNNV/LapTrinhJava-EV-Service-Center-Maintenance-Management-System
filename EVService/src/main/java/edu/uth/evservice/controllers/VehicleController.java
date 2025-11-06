package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.VehicleDto;
import edu.uth.evservice.requests.VehicleRequest;
import edu.uth.evservice.services.IVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')") 
@RequiredArgsConstructor
public class VehicleController {

    private final IVehicleService vehicleService;

    // đăng ký xe đ bảo dưỡng cho customer
    @PostMapping
    public ResponseEntity<VehicleDto> registerVehicleForCustomer(@Valid @RequestBody VehicleRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Gọi phương thức mới, an toàn hơn
        VehicleDto createdVehicle = vehicleService.registerVehicle(request, username);

        return new ResponseEntity<>(createdVehicle, HttpStatus.CREATED);
    }

    // GET /api/vehicles (Lấy tất cả xe của tôi)
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER,'STAFF','TECHNICIAN','ADMIN')") 
    public ResponseEntity<List<VehicleDto>> getMyVehicles() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<VehicleDto> vehicles = vehicleService.getMyVehicles(username);
        return ResponseEntity.ok(vehicles);
    }

    // GET /api/vehicles/{id} (Lấy 1 xe của tôi)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER,'STAFF','TECHNICIAN','ADMIN')") 
    public ResponseEntity<VehicleDto> getMyVehicleById(@PathVariable("id") Integer id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        VehicleDto vehicle = vehicleService.getMyVehicleById(id, username);
        return ResponseEntity.ok(vehicle);
    }

    // PUT /api/vehicles/{id} (Cập nhật 1 xe của tôi)
    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateMyVehicle(@PathVariable("id") Integer id,
                                                      @Valid @RequestBody VehicleRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        VehicleDto updatedVehicle = vehicleService.updateMyVehicle(id, request, username);
        return ResponseEntity.ok(updatedVehicle);
    }

    // DELETE /api/vehicles/{id} (Xóa 1 xe của tôi)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMyVehicle(@PathVariable("id") Integer id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        vehicleService.deleteMyVehicle(id, username);
        return ResponseEntity.noContent().build(); // Trả về 204 No Content
    }
}