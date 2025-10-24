package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeePerformanceDto {
    Integer staffId;
    String staffName;
    Long totalAppointments;       // Tổng số lịch được tạo
    Long completedAppointments;   // Lịch đã hoàn thành
    Double completionRate;        // Tỷ lệ hoàn thành (%)
    Long pendingAppointments;     // Lịch đang chờ xử lý
}
