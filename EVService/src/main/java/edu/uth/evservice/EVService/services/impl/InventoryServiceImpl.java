package edu.uth.evservice.EVService.services.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.InventoryDto;
import edu.uth.evservice.EVService.model.Inventory;
import edu.uth.evservice.EVService.repositories.IInventoryRepository;
import edu.uth.evservice.EVService.requests.InventoryRequest;
import edu.uth.evservice.EVService.services.InventoryService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class InventoryServiceImpl implements InventoryService {
    IInventoryRepository inventoryRepository;

    @Override
    public List<InventoryDto> getInventories() {
        List<Inventory> inventories = inventoryRepository.findAll();
        return inventories.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public InventoryDto getInventoryById(Integer id) {
        return inventoryRepository.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    public InventoryDto createInventory(InventoryRequest request) {
        if (request == null) {
            return null;
        }
        Inventory entity = new Inventory();
        entity.setQuantity(request.getQuantity());
        entity.setMin_quantity(request.getMin_quantity());
        entity.setCreatedAt(LocalDate.now());
        // updatedAt stays null on create

        Inventory saved = inventoryRepository.save(entity);
        return toDto(saved);
    }

    private InventoryDto toDto(Inventory inv) {
        if (inv == null) {
            return null;
        }
        return new InventoryDto(inv.getInventory_id(), inv.getQuantity(), inv.getMin_quantity());
    }
}