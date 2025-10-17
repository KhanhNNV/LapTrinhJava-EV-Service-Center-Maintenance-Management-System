package edu.uth.evservice.EVService.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

// Dữ liệu từ client gửi lên khi tạo hoặc update lịch hẹn
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentRequest {
    LocalDate appointmentDate;
    LocalTime appointmentTime;
    String serviceType;
    String status; // pending, confirmed, canceled, completed
    String note;

    Integer customerId;
    Integer createdById; // staff/technician
    Integer vehicleId;
    Integer centerId;
}