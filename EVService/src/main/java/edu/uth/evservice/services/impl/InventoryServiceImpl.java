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
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class InventoryServiceImpl implements IInventoryService {
    private final IInventoryRepository inventoryRepository;
    private final IPartRepository partRepository;
    private final IServiceCenterRepository serviceCenterRepository;
    private final IUserRepository userRepo;

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

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDto> getInventoriesByCenterId(Integer centerId) {
        // 1. Kiểm tra xem centerId có tồn tại không (tuỳ chọn, nhưng nên có)
        if (!serviceCenterRepository.existsById(centerId)) {
            throw new ResourceNotFoundException("Không tìm thấy trung tâm với id: " + centerId);
        }

        // 2. Gọi Repository lấy danh sách
        List<Inventory> inventories = inventoryRepository.findByServiceCenter_CenterId(centerId);

        // 3. Chuyển đổi sang DTO và trả về
        return inventories.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private InventoryDto toDto(Inventory inv) {
        return InventoryDto.builder()
                .inventoryId(inv.getInventoryId())
                .quantity(inv.getQuantity())
                .minQuantity(inv.getMinQuantity())
                .unitPrice(inv.getPart().getUnitPrice())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .partId(inv.getPart().getPartId())
                .partName(inv.getPart().getPartName())
                .centerId(inv.getServiceCenter().getCenterId())
                .centerName(inv.getServiceCenter().getCenterName())
                .build();
    }


}