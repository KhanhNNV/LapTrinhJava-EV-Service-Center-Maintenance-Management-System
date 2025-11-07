package edu.uth.evservice.controllers;

import java.util.List;

import edu.uth.evservice.requests.AddStockRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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


    // Nhập thêm hàng vào kho cho một trung tâm cụ thể.
    @PostMapping("/add-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryDto> addStock(
            @RequestBody AddStockRequest request) {

        InventoryDto updatedInventory = inventoryService.addStock(request);
        return ResponseEntity.ok(updatedInventory);
    }

}