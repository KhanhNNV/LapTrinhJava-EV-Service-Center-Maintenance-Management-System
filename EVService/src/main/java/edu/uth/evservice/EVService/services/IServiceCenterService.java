package edu.uth.evservice.EVService.services;

import java.util.List;

import edu.uth.evservice.EVService.dto.ServiceCenterDto;
import edu.uth.evservice.EVService.requests.ServiceCenterRequest;

public interface IServiceCenterService {
    ServiceCenterDto createServiceCenter(ServiceCenterRequest request);
    ServiceCenterDto getServiceCenterById(int centerId);
    List<ServiceCenterDto> getAllServiceCenters();
    ServiceCenterDto updateServiceCenter(int centerId, ServiceCenterRequest request);
    void deleteServiceCenter(int centerId);
}