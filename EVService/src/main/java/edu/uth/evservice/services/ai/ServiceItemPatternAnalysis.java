package edu.uth.evservice.services.ai;

import edu.uth.evservice.models.ServiceItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceItemPatternAnalysis {
    private LocalDateTime analysisDate;
    private Map<ServiceItem, List<PartUsage>> itemPartPatterns;
    private Map<String, Double> itemCoOccurrence;
    private Integer totalTicketsAnalyzed;
}