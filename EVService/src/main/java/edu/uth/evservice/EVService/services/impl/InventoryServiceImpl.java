package edu.uth.evservice.EVService.services.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.InventoryDto;
import edu.uth.evservice.EVService.model.Inventory;
import edu.uth.evservice.EVService.model.Part;
import edu.uth.evservice.EVService.model.ServiceCenter;
import edu.uth.evservice.EVService.repositories.IInventoryRepository;
import edu.uth.evservice.EVService.repositories.IPartRepository;
import edu.uth.evservice.EVService.repositories.IServiceCenterRepository;
import edu.uth.evservice.EVService.requests.InventoryRequest;
import edu.uth.evservice.EVService.services.IInventoryService;
import jakarta.persistence.EntityNotFoundException;
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

    // private Part findPartById(Integer id) {
    // if (id == null) {
    // throw new IllegalArgumentException("Part ID cannot be null");
    // }
    // return partRepository.findById(id)
    // .orElseThrow(() -> new EntityNotFoundException("Part not found with id: " +
    // id));
    // }

    // private ServiceCenter findServiceCenterById(Integer id) {
    // if (id == null) {
    // throw new IllegalArgumentException("Service center ID cannot be null");
    // }
    // return serviceCenterRepository.findById(id)
    // .orElseThrow(() -> new EntityNotFoundException("Service center not found with
    // id: " + id));
    // }

    @Override
    public List<InventoryDto> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryDto getInventoryById(Integer id) {
        return inventoryRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found with id: " + id));
    }

    @Override
    public InventoryDto createInventory(InventoryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Inventory request cannot be null");
        }
        ServiceCenter serviceCenter = serviceCenterRepository.findById(request.getCenterId())
                .orElseThrow(() -> new RuntimeException("Center not found"));
        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new RuntimeException("Part not found"));
        Inventory inventory = new Inventory();
        inventory.setQuantity(request.getQuantity());
        inventory.setMinQuantity(request.getMinQuantity());
        inventory.setCreatedAt(LocalDate.now());
        inventory.setPart(part); // Gán part
        inventory.setServiceCenter(serviceCenter); // Gán serviceCenter

        Inventory saved = inventoryRepository.save(inventory);
        return toDto(saved);
    }

    private InventoryDto toDto(Inventory inv) {
        if (inv == null) {
            return null;
        }

        InventoryDto dto = new InventoryDto();
        dto.setInventoryId(inv.getInventoryId());
        dto.setQuantity(inv.getQuantity());
        dto.setMinQuantity(inv.getMinQuantity());
        dto.setCreatedAt(inv.getCreatedAt());
        dto.setUpdatedAt(inv.getUpdatedAt());
        if (inv.getPart() != null) {
            dto.setPartId(inv.getPart().getPartId());
            dto.setPartName(inv.getPart().getPartName());
        }
        if (inv.getServiceCenter() != null) {
            dto.setCenterId(inv.getServiceCenter().getCenterId());
            dto.setCenterName(inv.getServiceCenter().getCenterName());
        }

        return dto;
    }

    @Override
    public InventoryDto updateInventory(Integer id, InventoryRequest inventory) {
        if (id == null || inventory == null) {
            throw new IllegalArgumentException("Id and inventory request cannot be null");
        }

        ServiceCenter serviceCenter = serviceCenterRepository.findById(inventory.getCenterId())
                .orElseThrow(() -> new RuntimeException("Center not found"));
        Part part = partRepository.findById(inventory.getPartId())
                .orElseThrow(() -> new RuntimeException("Part not found"));

        return inventoryRepository.findById(id).map(existing -> {
            existing.setQuantity(inventory.getQuantity());
            existing.setMinQuantity(inventory.getMinQuantity());
            existing.setUpdatedAt(LocalDate.now());
            existing.setPart(part);
            existing.setServiceCenter(serviceCenter);

            Inventory updated = inventoryRepository.save(existing);
            return toDto(updated);
        }).orElseThrow(() -> new EntityNotFoundException("Inventory not found with id: " + id));
    }

    @Override
    public void deleteInventory(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Id cannot be null");
        }
        inventoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Inventory not found with id: " + id));
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