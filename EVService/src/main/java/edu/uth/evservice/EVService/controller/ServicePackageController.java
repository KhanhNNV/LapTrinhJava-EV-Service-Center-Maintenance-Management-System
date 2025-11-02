package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.ServicePackageDto;
import edu.uth.evservice.EVService.requests.ServicePackageRequest;
import edu.uth.evservice.EVService.services.IServicePackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

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
        return new ResponseEntity<>(createdPackage, HttpStatus.CREATED);}

    // @GetMapping
    // public ResponseEntity<List<ServicePackageDto>> getAllPackages() {
    //     return ResponseEntity.ok(servicePackageService.getAllPackages());
    // }

    // @GetMapping("/{id}")
    // public ResponseEntity<ServicePackageDto> getPackageById(@PathVariable Integer id) {
    //     ServicePackageDto pkg = servicePackageService.getPackageById(id);
    //     return pkg != null ? ResponseEntity.ok(pkg) : ResponseEntity.notFound().build();
    // }

    // @PutMapping("/{id}")
    // public ResponseEntity<ServicePackageDto> updatePackage(
    //         @PathVariable Integer id,
    //         @RequestBody ServicePackageRequest request) {

    //     ServicePackageDto updated = servicePackageService.updatePackage(id, request);
    //     return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    // }

    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deletePackage(@PathVariable Integer id) {
    //     servicePackageService.deletePackage(id);
    //     return ResponseEntity.noContent().build();
    // }
}
