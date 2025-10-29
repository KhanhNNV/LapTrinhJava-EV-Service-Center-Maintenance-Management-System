package edu.uth.evservice.EVService.requests;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

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

    Integer vehicleId;
    Integer centerId;
}