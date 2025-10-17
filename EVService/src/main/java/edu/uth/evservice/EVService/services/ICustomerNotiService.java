package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.NotificationDto;
import edu.uth.evservice.EVService.requests.CustomerNotiRequest;

import java.util.List;

public interface ICustomerNotiService {
    List<NotificationDto> getAllNotifications();
    List<NotificationDto> getNotificationsByCustomer(int customerId);
    NotificationDto getNotificationById(int id);
    NotificationDto createNotification(CustomerNotiRequest request);
    NotificationDto markAsRead(int id);
    void deleteNotification(int id);
}