package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.NotificationDto;
import edu.uth.evservice.models.Notification;
import edu.uth.evservice.models.User;
import edu.uth.evservice.repositories.INotificationRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {

    // Repository để thao tác với bảng "notifications"
    private final INotificationRepository notificationRepository;

    private final IUserRepository userRepository;

    // Lấy tất cả thông báo trong hệ thống
    @Override
    public List<NotificationDto> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Lấy danh sách thông báo của 1 user (customer, employee, admin)
    @Override
    public List<NotificationDto> getNotificationsByUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay ID_user" + userId));
        return notificationRepository.findByUser(user)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết 1 thông báo theo ID
    @Override
    public NotificationDto getNotificationById(int id) {
        Notification noti = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        return toDto(noti);
    }

    // Tạo mới 1 thông báo
    @Override
    public NotificationDto createNotification(NotificationRequest request) {
        // Lấy reference tới User theo userId
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay ID_user" +request.getUserId()));

        // Tạo object Notification (chưa lưu)
        Notification noti = new Notification();
        noti.setUser(user); // Gán người nhận thông báo
        noti.setTitle(request.getTitle()); // Gán tiêu đề
        noti.setMessage(request.getMessage());// Gán nội dung
        noti.setIsRead(false); // Mặc định là chưa đọc

        // Lưu DB và trả về DTO
        return toDto(notificationRepository.save(noti));
    }

    // Đánh dấu 1 thông báo là "đã đọc"
    @Override
    public NotificationDto markAsRead(int id) {
        Notification noti = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        noti.setIsRead(true); // cập nhật trạng thái đã đọc
        return toDto(notificationRepository.save(noti));
    }

    // Xóa 1 thông báo khỏi DB
    @Override
    public void deleteNotification(int id) {
        notificationRepository.deleteById(id);
    }

    /**
     * Chuyển đổi từ Entity -> DTO
     * Dùng khi trả dữ liệu ra ngoài API (ẩn các quan hệ phức tạp)
     **/
    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .notificationId(n.getNotificationId()) // lấy ID
                .userId(n.getUser().getUserId()) // lấy ID người nhận
                .title(n.getTitle()) // tiêu đề
                .message(n.getMessage()) // nội dung
                .isRead(Boolean.TRUE.equals(n.getIsRead())) // convert Boolean -> boolean an toàn
                .createdAt(n.getCreatedAt()) // thời gian tạo
                .build();
    }
}
