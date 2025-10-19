package edu.uth.evservice.EVService.requests;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * Dữ liệu client gửi lên khi tạo / cập nhật ticket
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTicketRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String notes;
    private Integer appointmentId;
    private Integer technicianId;
}
