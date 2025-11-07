package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.ServiceCenterDto;
import edu.uth.evservice.requests.ServiceCenterRequest;

public interface IServiceCenterService {
    ServiceCenterDto createServiceCenter(ServiceCenterRequest request);
    ServiceCenterDto getServiceCenterById(int centerId);
    List<ServiceCenterDto> getAllServiceCenters();
    ServiceCenterDto updateServiceCenter(int centerId, ServiceCenterRequest request);
    void deleteServiceCenter(int centerId);
}