package edu.uth.evservice.EVService.model.enums;

public enum ServiceTicketStatus {
    PENDING, // Chờ xử lý (mới được tạo)
    IN_PROGRESS, // Đang tiến hành
    ON_HOLD, // Tạm dừng (ví dụ: chờ phụ tùng)
    COMPLETED, // Đã hoàn thành
    CANCELLED // Đã hủy
}
