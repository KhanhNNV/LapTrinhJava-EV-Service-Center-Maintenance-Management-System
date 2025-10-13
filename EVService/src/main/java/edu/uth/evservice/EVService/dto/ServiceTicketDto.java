package edu.uth.evservice.EVService.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * DTO dùng để trả dữ liệu qua API (tránh trả entity trực tiếp)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceTicketDto {
    private int ticketId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endTime;

    private String status;
    private String notes;

    // Chỉ trả id của appointment và technician để frontend liên kết
    private Integer appointmentId;
    private Integer technicianId;
}
