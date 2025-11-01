package edu.uth.evservice.EVService.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.ServiceCenterDto;
import edu.uth.evservice.EVService.requests.ServiceCenterRequest;
import edu.uth.evservice.EVService.services.IServiceCenterService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/controller/service-centers")
public class ServiceCenterController {

    @Autowired
    private IServiceCenterService serviceCenterService;

    // CREATE: Chỉ ADMIN mới có quyền tạo trung tâm dịch vụ
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCenterDto> createServiceCenter(@Valid @RequestBody ServiceCenterRequest request) {
        ServiceCenterDto createdCenter = serviceCenterService.createServiceCenter(request);
        return new ResponseEntity<>(createdCenter, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceCenterDto> getServiceCenterById(@PathVariable("id") int centerId) {
        ServiceCenterDto serviceCenterDto = serviceCenterService.getServiceCenterById(centerId);
        return ResponseEntity.ok(serviceCenterDto);
    }

    @GetMapping
    public ResponseEntity<List<ServiceCenterDto>> getAllServiceCenters() {
        List<ServiceCenterDto> serviceCenters = serviceCenterService.getAllServiceCenters();
        return ResponseEntity.ok(serviceCenters);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceCenterDto> updateServiceCenter(@PathVariable("id") int centerId, @RequestBody ServiceCenterRequest serviceCenterRequest) {
        ServiceCenterDto updatedServiceCenter = serviceCenterService.updateServiceCenter(centerId, serviceCenterRequest);
        return ResponseEntity.ok(updatedServiceCenter);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceCenter(@PathVariable("id") int centerId) {
        serviceCenterService.deleteServiceCenter(centerId);
        return ResponseEntity.noContent().build();
    }
}