package edu.uth.evservice.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import edu.uth.evservice.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.uth.evservice.dtos.ServiceCenterDto;
import edu.uth.evservice.models.ServiceCenter;
import edu.uth.evservice.repositories.IServiceCenterRepository;
import edu.uth.evservice.requests.ServiceCenterRequest;
import edu.uth.evservice.services.IServiceCenterService;

@Service
public class ServiceCenterServiceImpl implements IServiceCenterService {

    @Autowired
    private IServiceCenterRepository serviceCenterRepository;

    //Tạo trung tâm dịch vụ
    @Override
    public ServiceCenterDto createServiceCenter(ServiceCenterRequest request) {
        // Kiểm tra xem tên trung tâm đã tồn tại chưa để tránh trùng lặp
        if (serviceCenterRepository.existsByCenterName(request.getCenterName())) {
            throw new RuntimeException("Tên trung tâm '" + request.getCenterName() + "' đã tồn tại.");
        }

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
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCenter not found with id: " + centerId));
        return toDto(serviceCenter);
    }

    @Override
    public List<ServiceCenterDto> getAllServiceCenters() {
        return serviceCenterRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    //Cập nhật
    @Override
    public ServiceCenterDto updateServiceCenter(int centerId, ServiceCenterRequest request) {
        ServiceCenter existingCenter = serviceCenterRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trung tâm dịch vụ với ID: " + centerId));

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
            throw new RuntimeException("Không tìm thấy trung tâm dịch vụ với ID: " + centerId);
        }
        serviceCenterRepository.deleteById(centerId); // Thành công thì im lặng thất bại thì la lên
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