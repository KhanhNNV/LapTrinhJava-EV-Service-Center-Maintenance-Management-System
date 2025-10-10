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
    // id của appointment (bắt buộc nếu theo ERD)
    private Integer appointmentId;

    // id của technician (Employee)
    private Integer technicianId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    private String status;
    private String notes;
}
