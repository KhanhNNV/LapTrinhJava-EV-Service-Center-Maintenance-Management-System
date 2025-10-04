package edu.uth.evservice.EVService.services;

import java.util.List;

import edu.uth.evservice.EVService.dto.InventoryDto;
import edu.uth.evservice.EVService.requests.InventoryRequest;

public interface InventoryService {
    List<InventoryDto> getInventories();

    InventoryDto getInventoryById(Integer id);

    InventoryDto createInventory(InventoryRequest inventory);
}