package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.CustomerNotiDTO;
import edu.uth.evservice.EVService.requests.CustomerNotiRequest;

import java.util.List;

public interface ICustomerNotiService {
    List<CustomerNotiDTO> getAllNotifications();
    List<CustomerNotiDTO> getNotificationsByCustomer(int customerId);
    CustomerNotiDTO getNotificationById(int id);
    CustomerNotiDTO createNotification(CustomerNotiRequest request);
    CustomerNotiDTO markAsRead(int id);
    void deleteNotification(int id);
}