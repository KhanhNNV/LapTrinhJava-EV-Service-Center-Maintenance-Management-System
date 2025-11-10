package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.ServiceItemDto;
import edu.uth.evservice.requests.AddServiceItemRequest;
import edu.uth.evservice.requests.AddSuggestedPartRequest;
import edu.uth.evservice.requests.ServiceItemRequest;
import edu.uth.evservice.services.IServiceItemService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-items")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class ServiceItemController {

    IServiceItemService serviceItemService;

    // --- CRUD cho ServiceItem ---

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceItemDto> createServiceItem(@RequestBody ServiceItemRequest serviceItemRequest) {
        ServiceItemDto newItem = serviceItemService.createServiceItem(serviceItemRequest);
        return new ResponseEntity<>(newItem,HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF','TECHNICIAN')")
    public ResponseEntity<List<ServiceItemDto>> getAllServiceItems() {
        return ResponseEntity.ok(serviceItemService.getAllServiceItems());
    }

    @PutMapping("/{itemid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceItemDto> updateServiceItem(@PathVariable("itemid") Integer itemid,@RequestBody ServiceItemRequest serviceItemRequest) {
        ServiceItemDto newItem = serviceItemService.updateServiceItem(itemid,serviceItemRequest);
        return new ResponseEntity<>(newItem,HttpStatus.OK);
    }

    // --- Quản lý Gợi ý (ServiceItemPart) ---

    @PostMapping("/{itemId}/suggest-part")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceItemDto> addSuggestedPart(
            @PathVariable Integer itemId,
            @RequestBody AddSuggestedPartRequest request) {
        // Trả về ServiceItemDto chứa list gợi ý
        ServiceItemDto updatedItem = serviceItemService.addSuggestion(itemId, request.getPartId(), request.getQuantity());
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{itemId}/suggest-part/{partId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeSuggestedPart(
            @PathVariable Integer itemId,
            @PathVariable Integer partId) {
        serviceItemService.removeSuggestion(itemId, partId);
        return ResponseEntity.noContent().build();
    }


}
