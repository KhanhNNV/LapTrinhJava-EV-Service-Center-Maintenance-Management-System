package edu.uth.evservice.services;

import edu.uth.evservice.dtos.ServicePackageDto;
import edu.uth.evservice.requests.ServicePackageRequest;

import java.util.List;

public interface IServicePackageService {

    List<ServicePackageDto> getAllPackages();
    ServicePackageDto getPackageById(Integer id);

    ServicePackageDto createPackage(ServicePackageRequest request);
    ServicePackageDto updatePackage(Integer id, ServicePackageRequest request);
    void deletePackage(Integer id);
}
