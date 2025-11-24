package edu.uth.evservice.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

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
    String phoneNumber;

    Integer staffId;
    String staffName;
    Integer vehicleId;
    Integer centerId;
    String centerName;
    ServiceCenterDto serviceCenter;
    Integer technicianId;
    String technicianName;
    Integer contractId;
    String contractName;
    Integer ticketId;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}