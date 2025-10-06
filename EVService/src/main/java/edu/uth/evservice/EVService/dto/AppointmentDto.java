package edu.uth.evservice.EVService.dto;

import lombok.*;

import java.time.LocalDateTime;

// DTO = Data Transfer Object, dùng để truyền dữ liệu gọn gàng hơn
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDto {
    private int appointmentId;
    private int customerId;
    private int centerId;
    private int employeeId;
    private LocalDateTime appointmentDate;
    private String serviceType;
    private String status;
    private String note;
}