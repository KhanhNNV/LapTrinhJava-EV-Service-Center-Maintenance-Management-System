package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.ServicePackageDto;
import edu.uth.evservice.EVService.requests.ServicePackageRequest;
import edu.uth.evservice.EVService.services.IServicePackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/packages")
@RequiredArgsConstructor
public class ServicePackageController {

    private final IServicePackageService servicePackageService;

    @GetMapping
    public ResponseEntity<List<ServicePackageDto>> getAllPackages() {
        return ResponseEntity.ok(servicePackageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicePackageDto> getPackageById(@PathVariable Integer id) {
        ServicePackageDto pkg = servicePackageService.getPackageById(id);
        return pkg != null ? ResponseEntity.ok(pkg) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<ServicePackageDto> createPackage(@RequestBody ServicePackageRequest request) {
        return ResponseEntity.ok(servicePackageService.createPackage(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicePackageDto> updatePackage(
            @PathVariable Integer id,
            @RequestBody ServicePackageRequest request) {

        ServicePackageDto updated = servicePackageService.updatePackage(id, request);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Integer id) {
        servicePackageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
