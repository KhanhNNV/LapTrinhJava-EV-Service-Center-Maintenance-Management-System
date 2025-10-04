package edu.uth.evservice.EVService.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.ServiceCenterDto;
import edu.uth.evservice.EVService.model.ServiceCenter;
import edu.uth.evservice.EVService.repositories.IServiceCenterRepository;
import edu.uth.evservice.EVService.requests.ServiceCenterRequest;
import edu.uth.evservice.EVService.services.IServiceCenterService;

@Service
// Updated to implement IServiceCenterService
public class ServiceCenterServiceImpl implements IServiceCenterService {

    @Autowired
    private IServiceCenterRepository serviceCenterRepository;


    @Override
    public ServiceCenterDto createServiceCenter(ServiceCenterRequest request) {
        ServiceCenter serviceCenter = ServiceCenter.builder()
                .centerName(request.getCenterName())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .build();
        ServiceCenter savedServiceCenter = serviceCenterRepository.save(serviceCenter);
        return toDto(savedServiceCenter);
    }

    @Override
    public ServiceCenterDto getServiceCenterById(int centerId) {
        ServiceCenter serviceCenter = serviceCenterRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("ServiceCenter not found with id: " + centerId));
        return toDto(serviceCenter);
    }

    @Override
    public List<ServiceCenterDto> getAllServiceCenters() {
        return serviceCenterRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public ServiceCenterDto updateServiceCenter(int centerId, ServiceCenterRequest request) {
        ServiceCenter existingCenter = serviceCenterRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("ServiceCenter not found with id: " + centerId));

        if (request.getCenterName() != null) {
            existingCenter.setCenterName(request.getCenterName());
        }
        if (request.getAddress() != null) {
            existingCenter.setAddress(request.getAddress());
        }
        if (request.getPhoneNumber() != null) {
            existingCenter.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getEmail() != null) {
            existingCenter.setEmail(request.getEmail());
        }

        ServiceCenter updatedCenter = serviceCenterRepository.save(existingCenter);
        return toDto(updatedCenter);
    }


    @Override
    public void deleteServiceCenter(int centerId) {
        if (!serviceCenterRepository.existsById(centerId)) {
            throw new RuntimeException("ServiceCenter not found with id: " + centerId);
        }
        serviceCenterRepository.deleteById(centerId);
    }
    
    private ServiceCenterDto toDto(ServiceCenter serviceCenter) {
        return ServiceCenterDto.builder()
                .centerId(serviceCenter.getCenterId())
                .centerName(serviceCenter.getCenterName())
                .address(serviceCenter.getAddress())
                .phoneNumber(serviceCenter.getPhoneNumber())
                .email(serviceCenter.getEmail())
                .build();
    }
    
}