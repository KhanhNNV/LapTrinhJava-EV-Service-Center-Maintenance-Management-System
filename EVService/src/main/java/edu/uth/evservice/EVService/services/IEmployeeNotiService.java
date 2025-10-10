package edu.uth.evservice.EVService.services;

import java.util.List;  
import edu.uth.evservice.EVService.dto.EmployeeNotiDto;
import edu.uth.evservice.EVService.requests.EmployeeNotiRequest;

public interface IEmployeeNotiService {
    List<EmployeeNotiDto> getAllNotifications();
    List<EmployeeNotiDto> getNotificationsByEmployee(int employeeId);
    EmployeeNotiDto getNotificationById(int id);
    EmployeeNotiDto createNotification(EmployeeNotiRequest request);
    EmployeeNotiDto markAsRead(int id);
    void deleteNotification(int id);

}
