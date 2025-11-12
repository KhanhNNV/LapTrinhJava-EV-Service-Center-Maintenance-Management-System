package edu.uth.evservice.services.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import edu.uth.evservice.exception.ResourceNotFoundException;
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

    private InventoryDto toDto(Inventory inv) {
        return InventoryDto.builder()
                .inventoryId(inv.getInventoryId())
                .quantity(inv.getQuantity())
                .minQuantity(inv.getMinQuantity())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .partId(inv.getPart().getPartId())
                .partName(inv.getPart().getPartName())
                .centerId(inv.getServiceCenter().getCenterId())
                .centerName(inv.getServiceCenter().getCenterName())
                .build();
    }

    @Override
    public void deleteInventory(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Id cannot be null");
        }
        inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with id: " + id));
        inventoryRepository.deleteById(id);
    }

    @Override
    public List<InventoryDto> getInventoriesByPartId(Integer partId) {
        if (partId == null) {
            throw new IllegalArgumentException("PartId cannot be null");
        }
        return inventoryRepository.findByPart_PartId(partId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InventoryDto> getInventoriesByCenterId(Integer centerId) {
        if (centerId == null) {
            throw new IllegalArgumentException("CenterId cannot be null");
        }
        return inventoryRepository.findByServiceCenter_CenterId(centerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}