package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.model.ServicePackage;
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
    public ResponseEntity<List<ServicePackage>> getAllPackages() {
        return ResponseEntity.ok(servicePackageService.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicePackage> getPackageById(@PathVariable Long id) {
        ServicePackage pkg = servicePackageService.getPackageById(id);
        return pkg != null ? ResponseEntity.ok(pkg) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<ServicePackage> createPackage(@RequestBody ServicePackage servicePackage) {
        return ResponseEntity.ok(servicePackageService.createPackage(servicePackage));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicePackage> updatePackage(@PathVariable Long id, @RequestBody ServicePackage servicePackage) {
        ServicePackage updated = servicePackageService.updatePackage(id, servicePackage);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        servicePackageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
