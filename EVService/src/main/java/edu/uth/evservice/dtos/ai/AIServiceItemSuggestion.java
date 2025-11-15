package edu.uth.evservice.dtos.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIServiceItemSuggestion {

    /**
     * ID của ServiceItem được gợi ý
     */
    private Integer serviceItemId;

    /**
     * Tên của ServiceItem
     */
    private String serviceItemName;

    /**
     * Mô tả của ServiceItem (nếu có)
     */
    private String serviceItemDescription;

    /**
     * Danh sách các phụ tùng được AI gợi ý
     */
    private List<PartSuggestion> suggestions;

    /**
     * Giải thích từ AI về lý do gợi ý
     */
    private String aiReasoning;

    /**
     * Tổng số lượng gợi ý
     */
    private Integer totalSuggestions;

    /**
     * Điểm tin cậy tổng thể của AI (0.0 - 1.0)
     */
    private Double overallConfidenceScore;

    /**
     * Thời gian tạo gợi ý
     */
    private LocalDateTime generatedDate;

    /**
     * ID trung tâm dịch vụ
     */
    private Integer centerId;

    /**
     * Số lượng dữ liệu lịch sử được phân tích
     */
    private Integer historicalDataSize;

    /**
     * Khoảng thời gian phân tích (ví dụ: "3 tháng gần nhất")
     */
    private String analysisPeriod;

    /**
     * Inner class cho gợi ý phụ tùng
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartSuggestion {

        /**
         * ID của phụ tùng
         */
        private Integer partId;

        /**
         * Tên phụ tùng
         */
        private String partName;

        /**
         * Số lượng được gợi ý
         */
        private Integer suggestedQuantity;

        /**
         * Mức độ quan trọng (CAO/TRUNG_BÌNH/THẤP)
         */
        private String importanceLevel;

        /**
         * Điểm tin cậy cho gợi ý này (0.0 - 1.0)
         */
        private Double confidenceScore;

        /**
         * Lý do cụ thể cho gợi ý
         */
        private String reasoning;

        /**
         * Số lần phụ tùng này được sử dụng trong lịch sử
         */
        private Integer historicalUsageCount;

        /**
         * Tổng số lượng đã sử dụng trong lịch sử
         */
        private Integer historicalTotalQuantity;

        /**
         * Số lượng trung bình mỗi lần sử dụng
         */
        private Double historicalAverageQuantity;

        /**
         * Tỷ lệ sử dụng (% số lần service item này sử dụng phụ tùng này)
         */
        private Double usageRate;

        /**
         * Giá đơn vị hiện tại của phụ tùng
         */
        private Double currentUnitPrice;

        /**
         * Tổng chi phí ước tính cho số lượng gợi ý
         */
        private Double estimatedCost;

        /**
         * Có phải là gợi ý bắt buộc không
         */
        private Boolean isMandatory;

        /**
         * Các ServiceItems khác thường sử dụng cùng phụ tùng này
         */
        private List<String> commonlyUsedWith;
    }

    // Các methods utility

    /**
     * Tính tổng chi phí ước tính cho tất cả gợi ý
     */
    public Double getTotalEstimatedCost() {
        if (suggestions == null) return 0.0;

        return suggestions.stream()
                .mapToDouble(suggestion ->
                        suggestion.getEstimatedCost() != null ? suggestion.getEstimatedCost() : 0.0)
                .sum();
    }

    /**
     * Lấy số lượng gợi ý theo mức độ quan trọng
     */
    public Long getSuggestionCountByImportance(String importanceLevel) {
        if (suggestions == null) return 0L;

        return suggestions.stream()
                .filter(suggestion -> importanceLevel.equals(suggestion.getImportanceLevel()))
                .count();
    }

    /**
     * Kiểm tra xem có gợi ý nào không
     */
    public Boolean hasSuggestions() {
        return suggestions != null && !suggestions.isEmpty();
    }

    /**
     * Lấy gợi ý có điểm tin cậy cao nhất
     */
    public PartSuggestion getHighestConfidenceSuggestion() {
        if (!hasSuggestions()) return null;

        return suggestions.stream()
                .max((s1, s2) -> Double.compare(
                        s1.getConfidenceScore() != null ? s1.getConfidenceScore() : 0.0,
                        s2.getConfidenceScore() != null ? s2.getConfidenceScore() : 0.0
                ))
                .orElse(null);
    }

    /**
     * Lấy danh sách gợi ý bắt buộc
     */
    public List<PartSuggestion> getMandatorySuggestions() {
        if (suggestions == null) return List.of();

        return suggestions.stream()
                .filter(suggestion -> Boolean.TRUE.equals(suggestion.getIsMandatory()))
                .toList();
    }

    /**
     * Lấy danh sách gợi ý theo mức độ quan trọng
     */
    public List<PartSuggestion> getSuggestionsByImportance(String importanceLevel) {
        if (suggestions == null) return List.of();

        return suggestions.stream()
                .filter(suggestion -> importanceLevel.equals(suggestion.getImportanceLevel()))
                .toList();
    }

    /**
     * Tính điểm tin cậy trung bình của tất cả gợi ý
     */
    public Double getAverageConfidenceScore() {
        if (!hasSuggestions()) return 0.0;

        return suggestions.stream()
                .mapToDouble(suggestion ->
                        suggestion.getConfidenceScore() != null ? suggestion.getConfidenceScore() : 0.0)
                .average()
                .orElse(0.0);
    }
}