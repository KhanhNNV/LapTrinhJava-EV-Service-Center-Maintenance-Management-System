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

    // UPDATE: Chỉ ADMIN mới có quyền cập nhật
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServicePackageDto> updatePackage(@PathVariable("id") Integer id, @Valid @RequestBody ServicePackageRequest request) {
        ServicePackageDto updatedPackage = packageService.updatePackage(id, request);
        return ResponseEntity.ok(updatedPackage);
    }
    // // DELETE: Chỉ ADMIN mới có quyền xóa
    // @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    // public ResponseEntity<Void> deletePackage(@PathVariable("id") Integer id) {
    //     packageService.deletePackage(id);
    //     return ResponseEntity.noContent().build();
    // }
}
