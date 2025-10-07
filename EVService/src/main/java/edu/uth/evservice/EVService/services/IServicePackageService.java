package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.ServicePackageDto;
import edu.uth.evservice.EVService.requests.ServicePackageRequest;

import java.util.List;

public interface IServicePackageService {

    List<ServicePackageDto> getAllPackages();

    ServicePackageDto getPackageById(Long id);

    ServicePackageDto createPackage(ServicePackageRequest request);

    ServicePackageDto updatePackage(Long id, ServicePackageRequest request);

    void deletePackage(Long id);
}
