package edu.uth.evservice.EVService.model.enums;

public enum AppointmentStatus {
    PENDING, // Chờ xác nhận
    CONFIRMED, // Đã xác nhận và gán KTV
    CHECKED_IN, // Khách hàng đã đến
    CANCELED,
    COMPLETED
}
