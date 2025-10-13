package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.ServiceItemPartDto;
import edu.uth.evservice.EVService.requests.ServiceItemPartRequest;
import edu.uth.evservice.EVService.services.IServiceItemPartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/service-item-parts")
@RequiredArgsConstructor
public class ServiceItemPartController {

    private final IServiceItemPartService service;

    @GetMapping("/{serviceItemId}")
    public List<ServiceItemPartDto> getByServiceItem(@PathVariable Integer serviceItemId) {
        return service.getByServiceItem(serviceItemId);
    }

    @PostMapping
    public ServiceItemPartDto add(@RequestBody ServiceItemPartRequest request) {
        return service.add(request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
