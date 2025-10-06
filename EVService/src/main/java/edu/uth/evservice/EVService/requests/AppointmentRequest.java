package edu.uth.evservice.EVService.requests;

import lombok.*;

import java.time.LocalDateTime;

// Dữ liệu từ client gửi lên khi tạo hoặc update lịch hẹn
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequest {
    private int customerId;
    private int centerId;
    private int employeeId;
    private LocalDateTime appointmentDate;
    private String serviceType;
    private String note;
}