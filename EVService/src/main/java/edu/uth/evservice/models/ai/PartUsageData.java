package edu.uth.evservice.models.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartUsageData {
    private Integer centerId;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private List<PartUsageStats> partUsageStats;
    private List<SeasonalTrend> seasonalTrends;
    private Integer technicianCount;
    private Integer expectedVehicles;
    private Integer avgDeliveryDays;
}