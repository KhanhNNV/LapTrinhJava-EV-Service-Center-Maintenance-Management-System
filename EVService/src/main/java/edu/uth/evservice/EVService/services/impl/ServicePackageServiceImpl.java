package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.ServicePackageDto;
import edu.uth.evservice.EVService.model.ServicePackage;
import edu.uth.evservice.EVService.repositories.IServicePackageRepository;
import edu.uth.evservice.EVService.requests.ServicePackageRequest;
import edu.uth.evservice.EVService.services.IServicePackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicePackageServiceImpl implements IServicePackageService {

    private final IServicePackageRepository servicePackageRepository;

    // Chuyển đổi Entity -> DTO
    private ServicePackageDto toDto(ServicePackage entity) {
        ServicePackageDto dto = new ServicePackageDto();
        dto.setPackageId(entity.getPackageId());
        dto.setPackageName(entity.getPackageName());
        dto.setPrice(entity.getPrice());
        dto.setDuration(entity.getDuration());
        dto.setDescription(entity.getDescription());
        return dto;
    }

    // Chuyển đổi Request -> Entity
    private ServicePackage toEntity(ServicePackageRequest request) {
        return ServicePackage.builder()
                .packageName(request.getPackageName())
                .price(request.getPrice())
                .duration(request.getDuration())
                .build();
    }

    @Override
    public List<ServicePackageDto> getAllPackages() {
        return servicePackageRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ServicePackageDto getPackageById(Integer id) {
        return servicePackageRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public ServicePackageDto createPackage(ServicePackageRequest request) {
        ServicePackage servicePackage = toEntity(request);
        return toDto(servicePackageRepository.save(servicePackage));
    }

    @Override
    public ServicePackageDto updatePackage(Integer id, ServicePackageRequest request) {
        return servicePackageRepository.findById(id)
                .map(pkg -> {
                    pkg.setPackageName(request.getPackageName());
                    pkg.setPrice(request.getPrice());
                    pkg.setDuration(request.getDuration());
                    return toDto(servicePackageRepository.save(pkg));
                })
                .orElse(null);
    }

    @Override
    public void deletePackage(Integer id) {
        servicePackageRepository.deleteById(id);
    }
}
