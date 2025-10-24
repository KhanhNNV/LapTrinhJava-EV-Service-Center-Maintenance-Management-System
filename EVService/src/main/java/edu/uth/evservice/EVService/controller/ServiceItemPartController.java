package edu.uth.evservice.EVService.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.ServiceItemPartDto;
import edu.uth.evservice.EVService.requests.ServiceItemPartRequest;
import edu.uth.evservice.EVService.services.IServiceItemPartService;
import lombok.RequiredArgsConstructor;

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

    // @DeleteMapping("/{id}")
    // public void delete(@PathVariable Integer id) {
    // service.delete(id);
    // }
}
