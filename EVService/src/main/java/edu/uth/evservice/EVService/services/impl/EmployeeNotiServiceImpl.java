package edu.uth.evservice.EVService.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.EmployeeNotiDto;
import edu.uth.evservice.EVService.model.EmployeeNoti;
import edu.uth.evservice.EVService.model.employee.Employee;
import edu.uth.evservice.EVService.repositories.IEmployeeNotiRepository;
import edu.uth.evservice.EVService.repositories.IEmployeeRepository;
import edu.uth.evservice.EVService.requests.NotificationRequest;
import edu.uth.evservice.EVService.services.IEmployeeNotiService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeNotiServiceImpl implements IEmployeeNotiService{
    private final IEmployeeNotiRepository employeeNotiRepository;
    private final IEmployeeRepository employeeRepository;

    private EmployeeNotiDto toDto(EmployeeNoti noti){
        
        return EmployeeNotiDto.builder()
                .notiId(noti.getNotiId())
                .employeeId(noti.getEmployee() != null ? noti.getEmployee().getEmployeeId() : null)
                .title(noti.getTitle())
                .message(noti.getMessage())
                .readStatus(noti.isReadStatus())
                .createdAt(noti.getCreatedAt())
                .build();
    }
    
    @Override
    public List<EmployeeNotiDto> getAllNotifications(){
        return employeeNotiRepository.findAll().stream()
        .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public EmployeeNotiDto getNotificationById(int id) {
        return employeeNotiRepository.findById(id)
        .map(this::toDto).orElseThrow(() -> 
        new RuntimeException("Notification not found")
        );
    }
    
    @Override
    public List<EmployeeNotiDto> getNotificationsByEmployee(int employeeId) {
        return employeeNotiRepository.findByEmployeeEmployeeId(employeeId).stream()
        .map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public EmployeeNotiDto markAsRead(int id) {
        EmployeeNoti noti = employeeNotiRepository.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
        noti.setReadStatus(true);
        return toDto(employeeNotiRepository.save(noti));
    }

    @Override
    public EmployeeNotiDto createNotification(NotificationRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + request.getEmployeeId()));

        EmployeeNoti noti = EmployeeNoti.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .readStatus(false)
                .employee(employee)
                .build();
        return toDto(employeeNotiRepository.save(noti));
    }

    @Override
    public void deleteNotification(int id) {
        employeeNotiRepository.deleteById(id);
    }



}
