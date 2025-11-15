package edu.uth.evservice.dtos.ai;

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
public class AIPartSuggestionResponse {
    private Integer centerId;
    private LocalDate generatedDate;
    private List<PartSuggestion> suggestions;
    private String reasoning;
    private Double confidenceScore;

    @Data
    @Builder
    public static class PartSuggestion {
        private Integer partId;
        private String partName;
        private Integer currentStock;
        private Integer suggestedMinStock;
        private Integer suggestedMaxStock;
        private Integer reorderPoint;
        private String riskLevel;
        private String reasoning;
        private Double expectedMonthlyUsage;
    }
}