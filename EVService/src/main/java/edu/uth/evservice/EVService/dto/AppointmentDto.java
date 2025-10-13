package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

// DTO = Data Transfer Object, dùng để truyền dữ liệu gọn gàng hơn
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentDto {
    Integer appointmentId;
    LocalDate appointmentDate;
    LocalTime appointmentTime;
    String serviceType;
    String status;
    String note;

    Integer customerId;
    String customerName;
    Integer createdById;
    String createdByName;
    Integer vehicleId;
    Integer centerId;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}