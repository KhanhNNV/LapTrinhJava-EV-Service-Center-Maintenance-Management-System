package edu.uth.evservice.EVService.services;

import java.util.List;

import edu.uth.evservice.EVService.dto.InventoryDto;
import edu.uth.evservice.EVService.requests.InventoryRequest;

public interface IInventoryService {
    List<InventoryDto> getAllInventories();

    InventoryDto getInventoryById(Integer id);

    InventoryDto createInventory(InventoryRequest inventory);

    InventoryDto updateInventory(Integer id, InventoryRequest inventory);

    void deleteInventory(Integer id);
}