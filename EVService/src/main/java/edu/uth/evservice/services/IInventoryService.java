package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.InventoryDto;
import edu.uth.evservice.requests.AddStockRequest;
import edu.uth.evservice.requests.InventoryRequest;

public interface IInventoryService {
//    List<InventoryDto> getAllInventories();
//
//    InventoryDto getInventoryById(Integer id);
//
//    InventoryDto createInventory(InventoryRequest inventory);
//
//    InventoryDto updateInventory(Integer id, InventoryRequest inventory);
//
//    void deleteInventory(Integer id);
//
//    List<InventoryDto> getInventoriesByPartId(Integer partId);
//
//    List<InventoryDto> getInventoriesByCenterId(Integer centerId);

    InventoryDto addStock(AddStockRequest request);

    List<InventoryDto> getInventoryByTechnician(Integer technicianId);

    List<InventoryDto> getInventoriesByCenterId(Integer centerId);
}