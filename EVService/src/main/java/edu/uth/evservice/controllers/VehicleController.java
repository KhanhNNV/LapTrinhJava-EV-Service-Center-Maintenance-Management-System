package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.VehicleDto;
import edu.uth.evservice.requests.VehicleRequest;
import edu.uth.evservice.services.IVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    public ResponseEntity<VehicleDto> registerVehicleForCustomer(@Valid @RequestBody VehicleRequest request,Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());
        // Gọi phương thức mới, an toàn hơn
        VehicleDto createdVehicle = vehicleService.registerVehicle(request, UserId);

        return new ResponseEntity<>(createdVehicle, HttpStatus.CREATED);
    }

    // GET /api/vehicles (Lấy tất cả xe của tôi)
    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','STAFF','TECHNICIAN','ADMIN')") 
    public ResponseEntity<List<VehicleDto>> getMyVehicles(Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());
        List<VehicleDto> vehicles = vehicleService.getMyVehicles(UserId);
        return ResponseEntity.ok(vehicles);
    }

    // GET /api/vehicles/{id} (Lấy 1 xe của tôi)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public ResponseEntity<VehicleDto> getMyVehicleById(@PathVariable("id") Integer id, Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());
        VehicleDto vehicle = vehicleService.getMyVehicleById(id, UserId);
        return ResponseEntity.ok(vehicle);
    }

    // Lấy xe cho phần quản lý (theo id xe)
    @GetMapping("/manage/{id}")
    @PreAuthorize("hasAnyRole('STAFF','TECHNICIAN','ADMIN')")
    public ResponseEntity<VehicleDto> getVehicleById(@PathVariable("id") Integer id) {
        VehicleDto vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(vehicle);
    }

    // PUT /api/vehicles/{id} (Cập nhật 1 xe của tôi)
    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateMyVehicle(@PathVariable("id") Integer id,
                                                      @Valid @RequestBody VehicleRequest request, Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());                                            
        VehicleDto updatedVehicle = vehicleService.updateMyVehicle(id, request, UserId);
        return ResponseEntity.ok(updatedVehicle);
    }

    // DELETE /api/vehicles/{id} (Xóa 1 xe của tôi)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMyVehicle(@PathVariable("id") Integer id, Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName()); 
        vehicleService.deleteMyVehicle(id, UserId);
        return ResponseEntity.noContent().build(); // Trả về 204 No Content
    }
}