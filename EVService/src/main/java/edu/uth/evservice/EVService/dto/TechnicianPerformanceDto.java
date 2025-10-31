package edu.uth.evservice.EVService.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TechnicianPerformanceDto {
    private Integer technicianId;
    private String technicianName;
    private long totalTickets;     // Số phiếu hoàn thành
    private double avgMinutes;    // Trung bình thời gian xử lý (phút)
    private long totalMinutes;    // Tổng thời gian xử lý (phút)
}
