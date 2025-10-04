package edu.uth.evservice.EVService.services.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.InventoryDto;
import edu.uth.evservice.EVService.model.Inventory;
import edu.uth.evservice.EVService.repositories.IInventoryRepository;
import edu.uth.evservice.EVService.requests.InventoryRequest;
import edu.uth.evservice.EVService.services.IInventoryService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class InventoryServiceImpl implements IInventoryService {
    IInventoryRepository inventoryRepository;

    @Override
    public List<InventoryDto> getAllInventories() {
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

    @Override
    public Inventory updateInventory(Integer id, Inventory inventory) {
        if (id == null || inventory == null) {
            return null;
        }

        return inventoryRepository.findById(id).map(existing -> {
            // update only allowed fields
            existing.setQuantity(inventory.getQuantity());
            existing.setMin_quantity(inventory.getMin_quantity());
            existing.setUpdatedAt(LocalDate.now());
            return inventoryRepository.save(existing);
        }).orElse(null);
    }

    @Override
    public void deleteInventory(Integer id) {
        if (id == null) {
            return;
        }

        if (inventoryRepository.existsById(id)) {
            inventoryRepository.deleteById(id);
        }
    }
}