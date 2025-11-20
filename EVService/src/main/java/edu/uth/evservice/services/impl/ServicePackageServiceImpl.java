package edu.uth.evservice.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.uth.evservice.dtos.ServiceItemDto;
import edu.uth.evservice.dtos.ServicePackageDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.ServiceItem; // Import Model ServiceItem
import edu.uth.evservice.models.ServicePackage;
import edu.uth.evservice.repositories.IServiceItemRepository;
import edu.uth.evservice.repositories.IServicePackageRepository;
import edu.uth.evservice.requests.ServicePackageRequest;
import edu.uth.evservice.services.IServicePackageService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServicePackageServiceImpl implements IServicePackageService {

    private final IServicePackageRepository servicePackageRepository;
    private final IServiceItemRepository serviceItemRepository;

    private ServiceItemDto toItemDto(ServiceItem item) {
        return ServiceItemDto.builder()
                .id(item.getItemId())
                .itemName(item.getItemName())
                .description(item.getDescription())
                .price(item.getPrice())
                .build();
    }

    // --- HÀM HELPER CHUYỂN ĐỔI SANG DTO (Xử lý thủ công) ---
    private ServicePackageDto toDto(ServicePackage pkg) {
        if (pkg == null)
            return null;

        // 1. Map danh sách ServiceItem Entity -> ServiceItemDto
        // Lưu ý: Cần xử lý trường hợp list bị null để tránh lỗi
        List<ServiceItemDto> itemDtos = new ArrayList<>();
        if (pkg.getServiceItems() != null) {
            // GỌI HÀM toItemDto Ở ĐÂY
            itemDtos = pkg.getServiceItems().stream()
                    .map(this::toItemDto) // Sử dụng method reference cho gọn
                    .collect(Collectors.toList());
        }
        // 2. Map ServicePackage -> ServicePackageDto
        return ServicePackageDto.builder()
                .packageId(pkg.getPackageId())
                .packageName(pkg.getPackageName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .duration(pkg.getDuration())
                .serviceItems(itemDtos) // Gán danh sách đã map vào
                .build();
    }

    @Override
    @Transactional(readOnly = true) // Quan trọng để fetch Lazy list
    public List<ServicePackageDto> getAllPackages() {
        return servicePackageRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ServicePackageDto getPackageById(Integer packageId) {
        ServicePackage servicePackage = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói dịch vụ với ID: " + packageId));
        return toDto(servicePackage);
    }

    // ===== THÊM GÓI DỊCH VỤ =====
    @Override
    @Transactional // Cần Transaction để JPA tự động insert vào bảng trung gian
    public ServicePackageDto createPackage(ServicePackageRequest request) {
        if (servicePackageRepository.existsByPackageName(request.getPackageName())) {
            throw new ResourceNotFoundException("Tên gói dịch vụ '" + request.getPackageName() + "' đã tồn tại.");
        }

        // 1. Tạo Entity từ Request
        ServicePackage newPackage = ServicePackage.builder()
                .packageName(request.getPackageName())
                .price(request.getPrice())
                .duration(request.getDuration())
                .description(request.getDescription())
                .build();

        // 2. Xử lý Mối quan hệ Many-to-Many
        // Lấy danh sách ID từ request -> Tìm các Entity ServiceItem tương ứng -> Gán
        // vào Package
        if (request.getServiceItemIds() != null && !request.getServiceItemIds().isEmpty()) {
            List<ServiceItem> items = serviceItemRepository.findAll();

            // Kiểm tra nếu tìm thiếu (Option)
            if (items.size() != request.getServiceItemIds().size()) {
                // Có thể throw lỗi hoặc log warning nếu id gửi lên không tồn tại
            }

            newPackage.setServiceItems(items); // JPA sẽ tự xử lý bảng trung gian
        }

        ServicePackage savedPackage = servicePackageRepository.save(newPackage);
        return toDto(savedPackage);
    }

    @Override
    @Transactional
    public void deletePackage(Integer packageId) {
        if (!servicePackageRepository.existsById(packageId)) {
            throw new ResourceNotFoundException("Không tìm thấy gói dịch vụ với ID: " + packageId);
        }
        servicePackageRepository.deleteById(packageId);
    }

    // ===== CẬP NHẬT GÓI DỊCH VỤ =====
    @Override
    @Transactional
    public ServicePackageDto updatePackage(Integer packageId, ServicePackageRequest request) {
        ServicePackage existingPackage = servicePackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy gói dịch vụ với ID: " + packageId));

        // 1. Cập nhật thông tin cơ bản
        existingPackage.setPackageName(request.getPackageName());
        existingPackage.setPrice(request.getPrice());
        existingPackage.setDuration(request.getDuration());
        existingPackage.setDescription(request.getDescription());

        // 2. Cập nhật danh sách Service Items (Many-to-Many)
        if (request.getServiceItemIds() != null) {
            // Tìm danh sách item mới dựa trên list ID gửi lên
            List<ServiceItem> newItems = serviceItemRepository.findAll();

            // Ghi đè danh sách cũ bằng danh sách mới
            // JPA sẽ tự động xóa các dòng cũ trong bảng trung gian và thêm dòng mới
            existingPackage.setServiceItems(newItems);
        }

        ServicePackage updatedPackage = servicePackageRepository.save(existingPackage);
        return toDto(updatedPackage);
    }
}