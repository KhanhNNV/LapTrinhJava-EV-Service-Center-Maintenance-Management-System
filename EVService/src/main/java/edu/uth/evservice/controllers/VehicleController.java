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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vehicles")
@PreAuthorize("hasRole('CUSTOMER')")
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
}