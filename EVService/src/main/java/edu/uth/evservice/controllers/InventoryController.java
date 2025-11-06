package edu.uth.evservice.controllers;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.dtos.InventoryDto;
import edu.uth.evservice.requests.InventoryRequest;
import edu.uth.evservice.services.IInventoryService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/inventories")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@CrossOrigin(origins = "http://localhost:3000")
public class InventoryController {
    private final IInventoryService inventoryService;

    @GetMapping
    public List<InventoryDto> getInventories() {
        return inventoryService.getAllInventories();
    }

    @GetMapping("/{id}")
    public InventoryDto getInventoryById(@PathVariable Integer id) {
        return inventoryService.getInventoryById(id);
    }

    @GetMapping("/part/{partId}")
    public List<InventoryDto> getByPart(@PathVariable Integer partId) {
        return inventoryService.getInventoriesByPartId(partId);
    }

    @GetMapping("/service_centers/{centerId}")
    public List<InventoryDto> getByCenter(@PathVariable Integer centerId) {
        return inventoryService.getInventoriesByCenterId(centerId);
    }

    @PostMapping
    public InventoryDto createInventory(@Validated @RequestBody InventoryRequest request) {
        return inventoryService.createInventory(request);
    }

    @PutMapping("/{id}")
    public InventoryDto updateInventory(@PathVariable Integer id, @Validated @RequestBody InventoryRequest inventory) {
        return inventoryService.updateInventory(id, inventory);
    }

    @DeleteMapping("/{id}")
    public void deleteInventory(@PathVariable Integer id) {
        inventoryService.deleteInventory(id);
    }

}