package edu.uth.evservice.requests;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
