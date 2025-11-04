package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.ServicePackageDto;
import edu.uth.evservice.models.ServicePackage;
import edu.uth.evservice.repositories.IServicePackageRepository;
import edu.uth.evservice.requests.ServicePackageRequest;
import edu.uth.evservice.services.IServicePackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicePackageServiceImpl implements IServicePackageService {

    private final IServicePackageRepository servicePackageRepository;

// --- HÀM HELPER CHUYỂN ĐỔI SANG DTO ---
    private ServicePackageDto toDto(ServicePackage pkg) {
        return ServicePackageDto.builder()
                .packageId(pkg.getPackageId())
                .packageName(pkg.getPackageName())
                .price(pkg.getPrice())
                .duration(pkg.getDuration())
                .description(pkg.getDescription())
                .build();
    }

    // Chuyển đổi Request -> Entity
    // private ServicePackage toEntity(ServicePackageRequest request) {
    //     return ServicePackage.builder()
    //             .packageName(request.getPackageName())
    //             .price(request.getPrice())
    //             .duration(request.getDuration())
    //             .build();
    // }

   @Override
    public List<ServicePackageDto> getAllPackages() {
        return servicePackageRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ServicePackageDto getPackageById(Integer packageId) {
        ServicePackage servicePackage = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ với ID: " + packageId));
        return toDto(servicePackage);
    }

    // ===== THÊM XÓA SỬA CHO ADMIN
    @Override
    public ServicePackageDto createPackage(ServicePackageRequest request) {
        // Sử dụng phương thức kiểm tra 'packageName'
        if (servicePackageRepository.existsByPackageName(request.getPackageName())) {
            throw new RuntimeException("Tên gói dịch vụ '" + request.getPackageName() + "' đã tồn tại.");
        }

        // Tạo Entity từ Request, sử dụng đúng tên trường
        ServicePackage newPackage = ServicePackage.builder()
                .packageName(request.getPackageName())
                .price(request.getPrice())
                .duration(request.getDuration())
                .description(request.getDescription()) // Thêm description
                .build();
        
        ServicePackage savedPackage = servicePackageRepository.save(newPackage);
        return toDto(savedPackage);
    }

    @Override
    public void deletePackage(Integer packageId) {
        if (!servicePackageRepository.existsById(packageId)) {
            throw new RuntimeException("Không tìm thấy gói dịch vụ với ID: " + packageId);
        }
        servicePackageRepository.deleteById(packageId);
    }

    @Override
    public ServicePackageDto updatePackage(Integer packageId, ServicePackageRequest request) {
        ServicePackage existingPackage = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ với ID: " + packageId));

        // Cập nhật các trường từ request
        existingPackage.setPackageName(request.getPackageName());
        existingPackage.setPrice(request.getPrice());
        existingPackage.setDuration(request.getDuration());
        existingPackage.setDescription(request.getDescription()); // Cập nhật description

        ServicePackage updatedPackage = servicePackageRepository.save(existingPackage);
        return toDto(updatedPackage);
    }


}
