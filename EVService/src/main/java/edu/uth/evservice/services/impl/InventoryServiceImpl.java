package edu.uth.evservice.services.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.AddStockRequest;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.INotificationService;
import org.springframework.stereotype.Service;

import edu.uth.evservice.dtos.InventoryDto;
import edu.uth.evservice.models.Inventory;
import edu.uth.evservice.models.Part;
import edu.uth.evservice.models.ServiceCenter;
import edu.uth.evservice.repositories.IInventoryRepository;
import edu.uth.evservice.repositories.IPartRepository;
import edu.uth.evservice.repositories.IServiceCenterRepository;
import edu.uth.evservice.requests.InventoryRequest;
import edu.uth.evservice.services.IInventoryService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class InventoryServiceImpl implements IInventoryService {
    private final IInventoryRepository inventoryRepository;
    private final IPartRepository partRepository;
    private final IServiceCenterRepository serviceCenterRepository;
    //
    private final INotificationService notificationService;

    private final IUserRepository userRepo;

    @Override
    public List<InventoryDto> getAllInventories() {
        List<Inventory> inventories = inventoryRepository.findAll();

        return inventories.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryDto addStock(AddStockRequest request) {
        if (request.getQuantityToAdd() <= 0) {
            throw new IllegalArgumentException("Số lượng không được âm.");
        }

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng:" + request.getPartId()));

        ServiceCenter center = serviceCenterRepository.findById(request.getCenterId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trung tâm: " + request.getCenterId()));

        // Tạo mới Inventory nếu chưa thêm vào lần nào
        Inventory inventory = inventoryRepository.findByPart_PartIdAndServiceCenter(part.getPartId(), center)
                .orElseGet(() ->
                        Inventory.builder()
                                .part(part)
                                .serviceCenter(center)
                                .quantity(0)
                                .minQuantity(5L)
                                .createdAt(LocalDate.now())
                                .build()
                );

        // Cộng thêm vào kho
        inventory.setQuantity(inventory.getQuantity() + request.getQuantityToAdd());
        inventory.setUpdatedAt(LocalDate.now());
        Inventory savedInventory = inventoryRepository.save(inventory);

        return toDto(savedInventory);
    }

    @Override
    public List<InventoryDto> getInventoryByTechnician(Integer technicianId) {
        User technician = userRepo.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kĩ thuật viên này"));

        ServiceCenter center = technician.getServiceCenter();
        if (center == null) {
            throw new IllegalStateException("Kỹ thuật viên này thuộc trung tâm nào");
        }

        List<Inventory> inventories = inventoryRepository.findByServiceCenter(center);

        // 3. Convert sang DTO
        return inventories.stream().map(this::toDto).collect(Collectors.toList());
    }

    private InventoryDto toDto(Inventory inventory) {
        return InventoryDto.builder()
                .inventoryId(inventory.getInventoryId())
                .quantity(inventory.getQuantity())
                // Lấy minQuantity để Frontend so sánh cảnh báo
                .minQuantity(inventory.getMinQuantity())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())

                // Map thông tin từ bảng Part
                .partId(inventory.getPart() != null ? inventory.getPart().getPartId() : null)
                .partName(inventory.getPart() != null ? inventory.getPart().getPartName() : "Unknown Part")
                .unitPrice(inventory.getPart() != null ? inventory.getPart().getUnitPrice() : 0.0)

                // Map thông tin từ bảng ServiceCenter
                .centerId(inventory.getServiceCenter() != null ? inventory.getServiceCenter().getCenterId() : null)
                .centerName(inventory.getServiceCenter() != null ? inventory.getServiceCenter().getCenterName() : "Unknown Center")

                .build();
    }

}