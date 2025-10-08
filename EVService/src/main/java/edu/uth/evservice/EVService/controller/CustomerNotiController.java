package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.CustomerNotiDTO;
import edu.uth.evservice.EVService.requests.CustomerNotiRequest;
import edu.uth.evservice.EVService.services.ICustomerNotiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customernoti")
@RequiredArgsConstructor
public class CustomerNotiController {

    private final ICustomerNotiService customerNotiService;

    @GetMapping
    public List<CustomerNotiDTO> getAll() {
        return customerNotiService.getAllNotifications();
    }

    @GetMapping("/customer/{customerId}")
    public List<CustomerNotiDTO> getByCustomer(@PathVariable int customerId) {
        return customerNotiService.getNotificationsByCustomer(customerId);
    }

    @GetMapping("/{id}")
    public CustomerNotiDTO getById(@PathVariable int id) {
        return customerNotiService.getNotificationById(id);
    }

    @PostMapping
    public CustomerNotiDTO create(@RequestBody CustomerNotiRequest request) {
        return customerNotiService.createNotification(request);
    }

    @PutMapping("/{id}/read")
    public CustomerNotiDTO markAsRead(@PathVariable int id) {
        return customerNotiService.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        customerNotiService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}