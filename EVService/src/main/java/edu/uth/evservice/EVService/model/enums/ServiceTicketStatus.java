package edu.uth.evservice.EVService.model.enums;

public enum ServiceTicketStatus {
    IN_PROGRESS, // Khi technician tao phieu thi bat dau lam viec luon
    ON_HOLD, // Tạm dừng (ví dụ: chờ phụ tùng)
    COMPLETED, // Đã hoàn thành
    CANCELLED // Đã hủy
}