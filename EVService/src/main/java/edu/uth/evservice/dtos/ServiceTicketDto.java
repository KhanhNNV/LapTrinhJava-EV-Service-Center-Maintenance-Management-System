package edu.uth.evservice.dtos;

import lombok.*;


import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO dùng để trả dữ liệu qua API (tránh trả entity trực tiếp)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ServiceTicketDto {
    private Integer ticketId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String notes;

    private Integer appointmentId;
    private Integer technicianId;
    private List<Integer> ticketServiceItemIds;
    private List<Integer> ticketPartIds;
}
