package edu.uth.evservice.models.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartUsageStats {
    private Integer partId;
    private String partName;
    private Integer totalUsage;
    private Double monthlyAverage;
    private Integer maxUsage;
    private Integer minUsage;
    private Integer usageFrequency;
}