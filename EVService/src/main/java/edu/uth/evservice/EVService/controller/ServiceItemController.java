package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.ServiceItemDto;
import edu.uth.evservice.EVService.requests.CreateServiceItemRequest;
import edu.uth.evservice.EVService.services.IServiceItemService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/service-items")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceItemController {

    IServiceItemService serviceItemService;

    @GetMapping
    public List<ServiceItemDto> getAllServiceItems() {
        return serviceItemService.getAllServiceItems();
    }

    @GetMapping("/{id}")
    public ServiceItemDto getServiceItemById(@PathVariable Integer id) {
        return serviceItemService.getServiceItemById(id);
    }

    @PostMapping
    public ServiceItemDto createServiceItem(@RequestBody CreateServiceItemRequest request) {
        return serviceItemService.createServiceItem(request);
    }

    @PutMapping("/{id}")
    public ServiceItemDto updateServiceItem(@PathVariable Integer id, @RequestBody CreateServiceItemRequest request) {
        return serviceItemService.updateServiceItem(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteServiceItem(@PathVariable Integer id) {
        serviceItemService.deleteServiceItem(id);
    }
}
