package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.model.ServicePackage;
import edu.uth.evservice.EVService.repositories.IServicePackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IServicePackageService {

    private final IServicePackageRepository servicePackageRepository;

    public List<ServicePackage> getAllPackages() {
        return servicePackageRepository.findAll();
    }

    public ServicePackage getPackageById(Long id) {
        return servicePackageRepository.findById(id).orElse(null);
    }

    public ServicePackage createPackage(ServicePackage servicePackage) {
        return servicePackageRepository.save(servicePackage);
    }

    public ServicePackage updatePackage(Long id, ServicePackage updated) {
        return servicePackageRepository.findById(id)
                .map(pkg -> {
                    pkg.setPackageName(updated.getPackageName());
                    pkg.setPrice(updated.getPrice());
                    pkg.setDuration(updated.getDuration());
                    pkg.setDescription(updated.getDescription());
                    return servicePackageRepository.save(pkg);
                })
                .orElse(null);
    }

    public void deletePackage(Long id) {
        servicePackageRepository.deleteById(id);
    }
}
