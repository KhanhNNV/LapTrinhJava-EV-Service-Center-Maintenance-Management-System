package edu.uth.evservice.EVService.services;

import java.util.List;  
import edu.uth.evservice.EVService.dto.EmployeeNotiDto;
import edu.uth.evservice.EVService.requests.NotificationRequest;

public interface IEmployeeNotiService {
    List<EmployeeNotiDto> getAllNotifications();
    List<EmployeeNotiDto> getNotificationsByEmployee(int employeeId);
    EmployeeNotiDto getNotificationById(int id);
    EmployeeNotiDto createNotification(NotificationRequest request);
    EmployeeNotiDto markAsRead(int id);
    void deleteNotification(int id);

}
