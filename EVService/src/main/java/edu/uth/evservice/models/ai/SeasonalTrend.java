package edu.uth.evservice.models.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonalTrend {
    private String partName;
    private String season;
    private Double increasePercentage;
}