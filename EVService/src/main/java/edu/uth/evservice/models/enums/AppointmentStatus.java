package edu.uth.evservice.models.enums;

public enum AppointmentStatus {
    PENDING, // Chờ xác nhận
    CONFIRMED, // Đã xác nhận
    CHECKED_IN, // Khách hàng đã đến
    ASSIGNED,
    IN_PROGRESS,
    CANCELED,
    COMPLETED
}
