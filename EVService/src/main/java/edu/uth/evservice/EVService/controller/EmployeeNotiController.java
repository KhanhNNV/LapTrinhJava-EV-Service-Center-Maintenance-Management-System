package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.EmployeeNotiDto;
import edu.uth.evservice.EVService.requests.EmployeeNotiRequest;
import edu.uth.evservice.EVService.services.IEmployeeNotiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employeenoti")
@RequiredArgsConstructor
public class EmployeeNotiController {

    private final IEmployeeNotiService employeeNotiService;

    @GetMapping
    public List<EmployeeNotiDto> getAll() {
        return employeeNotiService.getAllNotifications();
    }

    @GetMapping("/employee/{employeeId}")
    public List<EmployeeNotiDto> getByEmployee(@PathVariable int employeeId) {
        return employeeNotiService.getNotificationsByEmployee(employeeId);
    }

    @GetMapping("/{id}")
    public EmployeeNotiDto getById(@PathVariable int id) {
        return employeeNotiService.getNotificationById(id);
    }

    @PostMapping
    public EmployeeNotiDto create(@RequestBody EmployeeNotiRequest request) {
        return employeeNotiService.createNotification(request);
    }

    @PutMapping("/{id}/read")
    public EmployeeNotiDto markAsRead(@PathVariable int id) {
        return employeeNotiService.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        employeeNotiService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}