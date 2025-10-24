package edu.uth.evservice.EVService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// trả về tổng hợp chi phí cho client
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostSummaryResponseDto {
    private Double totalCost;
    private Integer totalServices;
    private Double averageCost;
}