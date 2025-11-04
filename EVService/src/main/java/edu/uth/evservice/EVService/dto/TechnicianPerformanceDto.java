package edu.uth.evservice.EVService.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TechnicianPerformanceDto {
    private Integer technicianId;
    private String technicianName;

    private long totalTickets;          // Tổng số vé hoàn thành
    private long totalMinutes;          // Tổng thời gian thực tế
    private double avgMinutes;          // Thời gian trung bình thực tế
    private double avgEstimatedMinutes; // Thời gian ước lượng trung bình
    private double efficiencyRate;      // Hiệu suất (%)
}
