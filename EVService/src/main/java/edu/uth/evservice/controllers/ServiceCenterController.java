package edu.uth.evservice.controllers;

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

import edu.uth.evservice.dtos.ServiceCenterDto;
import edu.uth.evservice.requests.ServiceCenterRequest;
import edu.uth.evservice.services.IServiceCenterService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/service-centers")
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

    // DELETE: Chỉ ADMIN mới có quyền xóa
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteServiceCenter(@PathVariable Integer id) {
        serviceCenterService.deleteServiceCenter(id);
        return ResponseEntity.noContent().build();
    }

    // // UPDATE: Chỉ ADMIN mới có quyền cập nhật
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCenterDto> updateServiceCenter(@PathVariable Integer id,
            @Valid @RequestBody ServiceCenterRequest request) {
        ServiceCenterDto updatedCenter = serviceCenterService.updateServiceCenter(id, request);
        return ResponseEntity.ok(updatedCenter);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<ServiceCenterDto> getServiceCenterById(@PathVariable("id") int centerId) {
        ServiceCenterDto serviceCenterDto = serviceCenterService.getServiceCenterById(centerId);
        return ResponseEntity.ok(serviceCenterDto);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','CUSTOMER')")
    public ResponseEntity<List<ServiceCenterDto>> getAllServiceCenters() {
        List<ServiceCenterDto> serviceCenters = serviceCenterService.getAllServiceCenters();
        return ResponseEntity.ok(serviceCenters);
    }

}