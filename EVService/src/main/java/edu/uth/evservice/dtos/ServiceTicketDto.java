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

    private String serviceType;
    private String noteCus;
    private String customerName;
    private String staffName;
    private String licensePlate;

    private Integer technicianId;
    private List<TicketServiceItemDto> items;
    private List<TicketPartDto> parts;
}
