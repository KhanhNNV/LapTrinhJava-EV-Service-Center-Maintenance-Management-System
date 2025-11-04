package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.ServicePackageDto;
import edu.uth.evservice.requests.ServicePackageRequest;
import edu.uth.evservice.services.IServicePackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/service-packages")
@RequiredArgsConstructor
public class ServicePackageController {

    private final IServicePackageService packageService;

    // CREATE: Chỉ ADMIN mới có quyền tạo
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServicePackageDto> createPackage(@Valid @RequestBody ServicePackageRequest request) {
        ServicePackageDto createdPackage = packageService.createPackage(request);
        return new ResponseEntity<>(createdPackage, HttpStatus.CREATED);
    }

    // UPDATE: Chỉ ADMIN mới có quyền cập nhật
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServicePackageDto> updatePackage(@PathVariable("id") Integer id,
            @Valid @RequestBody ServicePackageRequest request) {
        ServicePackageDto updatedPackage = packageService.updatePackage(id, request);
        return ResponseEntity.ok(updatedPackage);
    }

    // DELETE: Chỉ ADMIN mới có quyền xóa
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePackage(@PathVariable("id") Integer id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }

    // READ ALL: Ai cũng có thể xem danh sách (Customer, Staff, Admin)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<List<ServicePackageDto>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    // READ ONE: Ai cũng có thể xem chi tiết
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<ServicePackageDto> getPackageById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }
}
