package edu.uth.evservice.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TechnicianPerformanceDto {
    private Integer technicianId;
    private String fullName;
    private Long totalTickets; // Tổng số ticket hoàn thành
    private Double totalHours; // Tổng số giờ làm việc (hoặc tổng thời gian service)
}