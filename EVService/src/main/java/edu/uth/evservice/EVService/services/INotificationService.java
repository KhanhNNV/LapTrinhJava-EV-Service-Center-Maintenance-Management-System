package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.NotificationDto;
import edu.uth.evservice.EVService.requests.NotificationRequest;

import java.util.List;

/**
 * Interface chung thay thế cho ICustomerNotiService và IEmployeeNotiService
 * Dùng cho tất cả loại user (Customer, Employee, Admin)
 */
public interface INotificationService {
    // Lấy toàn bộ thông báo
    List<NotificationDto> getAllNotifications();

    // Lấy thông báo theo userId (có thể là customerId hoặc employeeId)
    List<NotificationDto> getNotificationsByUser(int userId);

    // Lấy thông báo chi tiết theo id
    NotificationDto getNotificationById(int id);

    // Tạo thông báo mới
    NotificationDto createNotification(NotificationRequest request);

    // Đánh dấu đã đọc
    NotificationDto markAsRead(int id);

    // Xóa thông báo
    void deleteNotification(int id);
}
