package edu.uth.evservice.services.ai;

import edu.uth.evservice.dtos.ai.AIPartSuggestionResponse;
import edu.uth.evservice.models.ai.PartUsageData;
import edu.uth.evservice.models.ai.PartUsageStats;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PartDemandAIService {

    private final ChatClient chatClient;
    private final PartUsageDataService partUsageDataService;

    @Value("${app.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("${app.ai.suggestion.enabled:true}")
    private boolean aiSuggestionEnabled;

    @Value("${app.ai.suggestion.timeout-seconds:30}")
    private int timeoutSeconds;

    public AIPartSuggestionResponse generatePartSuggestions(Integer centerId,
                                                            LocalDate startDate,
                                                            LocalDate endDate) {

        log.info("Generating AI part suggestions for center {} from {} to {}", centerId, startDate, endDate);

        PartUsageData usageData = partUsageDataService.getPartUsageData(centerId, startDate, endDate);

        if (!aiEnabled || !aiSuggestionEnabled) {
            log.info("AI is disabled, using rule-based suggestions");
            return generateRuleBasedSuggestions(usageData);
        }

        try {
            String prompt = buildPartSuggestionPrompt(usageData);

            log.debug("Sending prompt to Google Gemini: {}", prompt);

            String aiResponse = chatClient.prompt()
                    .system("""
                        Bạn là chuyên gia quản lý tồn kho cho trung tâm dịch vụ xe điện.
                        Nhiệm vụ: Phân tích dữ liệu lịch sử sử dụng phụ tùng và đưa ra đề xuất tồn kho tối ưu.
                        Nguyên tắc:
                        - Luôn xem xét nhu cầu lịch sử, xu hướng theo mùa, thời gian giao hàng, và yếu tố an toàn
                        - Đưa ra các con số cụ thể, thực tế
                        - Tính đến inventory turnover và carrying costs
                        - Trả lời bằng tiếng Việt, rõ ràng, có cấu trúc
                        """)
                    .user(prompt)
                    .call()
                    .content();

            log.debug("Google Gemini Response: {}", aiResponse);

            return parseAIResponse(aiResponse, usageData);

        } catch (Exception e) {
            log.error("Google Gemini service call failed, falling back to rule-based suggestions: {}", e.getMessage());
            return generateRuleBasedSuggestions(usageData);
        }
    }

    private String buildPartSuggestionPrompt(PartUsageData usageData) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("PHÂN TÍCH DỮ LIỆU TỒN KHO XE ĐIỆN\n\n");

        prompt.append("## DỮ LIỆU SỬ DỤNG PHỤ TÙNG:\n");
        for (PartUsageStats stats : usageData.getPartUsageStats()) {
            prompt.append(String.format("### %s\n", stats.getPartName()));
            prompt.append(String.format("- Trung bình: %.2f/tháng\n", stats.getMonthlyAverage()));
            prompt.append(String.format("- Cao nhất: %d, Thấp nhất: %d\n", stats.getMaxUsage(), stats.getMinUsage()));
            prompt.append(String.format("- Tần suất sử dụng: %d lần\n", stats.getUsageFrequency()));
            prompt.append(String.format("- Tổng sử dụng: %d\n\n", stats.getTotalUsage()));
        }

        prompt.append("## THÔNG TIN HỆ THỐNG:\n");
        prompt.append(String.format("- Số kỹ thuật viên: %d\n", usageData.getTechnicianCount()));
        prompt.append(String.format("- Dự báo xe đến: %d xe/tháng\n", usageData.getExpectedVehicles()));
        prompt.append(String.format("- Thời gian giao hàng: %d ngày\n\n", usageData.getAvgDeliveryDays()));

        prompt.append("## XU HƯỚNG THEO MÙA:\n");
        if (usageData.getSeasonalTrends().isEmpty()) {
            prompt.append("- Không có dữ liệu xu hướng rõ rệt\n\n");
        } else {
            for (var trend : usageData.getSeasonalTrends()) {
                prompt.append(String.format("- %s: Tăng %.1f%% trong %s\n",
                        trend.getPartName(), trend.getIncreasePercentage(), trend.getSeason()));
            }
            prompt.append("\n");
        }

        prompt.append("## YÊU CẦU ĐỀ XUẤT:\n");
        prompt.append("Với mỗi phụ tùng, hãy đề xuất:\n");
        prompt.append("1. Lượng tồn kho TỐI THIỂU (tính safety stock)\n");
        prompt.append("2. Điểm đặt hàng lại (reorder point)\n");
        prompt.append("3. Lượng tồn kho TỐI ĐA\n");
        prompt.append("4. Mức độ rủi ro (CAO/TRUNG BÌNH/THẤP)\n");
        prompt.append("5. Lý do ngắn gọn cho đề xuất\n\n");

        prompt.append("Công thức tham khảo:\n");
        prompt.append("- Safety Stock = (Max Usage - Avg Usage) * Lead Time\n");
        prompt.append("- Reorder Point = (Avg Daily Usage * Lead Time) + Safety Stock\n");
        prompt.append("- Min Stock = Reorder Point\n");
        prompt.append("- Max Stock = Min Stock * 1.5\n");

        return prompt.toString();
    }

    // Các methods còn lại giữ nguyên...
    private AIPartSuggestionResponse parseAIResponse(String aiResponse, PartUsageData usageData) {
        List<AIPartSuggestionResponse.PartSuggestion> suggestions = new ArrayList<>();

        for (PartUsageStats stats : usageData.getPartUsageStats()) {
            AIPartSuggestionResponse.PartSuggestion suggestion = parseSuggestionForPart(aiResponse, stats, usageData);
            suggestions.add(suggestion);
        }

        return AIPartSuggestionResponse.builder()
                .centerId(usageData.getCenterId())
                .generatedDate(LocalDate.now())
                .suggestions(suggestions)
                .reasoning(extractReasoning(aiResponse))
                .confidenceScore(0.85)
                .build();
    }

    private AIPartSuggestionResponse.PartSuggestion parseSuggestionForPart(String aiResponse,
                                                                           PartUsageStats stats,
                                                                           PartUsageData usageData) {
        // Basic parsing logic - bạn có thể cải thiện phần này
        int suggestedMin = calculateSuggestedMinStock(stats, usageData);
        int reorderPoint = calculateReorderPoint(stats, suggestedMin);
        String riskLevel = calculateRiskLevel(stats, usageData);

        return AIPartSuggestionResponse.PartSuggestion.builder()
                .partId(stats.getPartId())
                .partName(stats.getPartName())
                .suggestedMinStock(suggestedMin)
                .suggestedMaxStock((int)(suggestedMin * 1.5))
                .reorderPoint(reorderPoint)
                .riskLevel(riskLevel)
                .reasoning("Đề xuất dựa trên phân tích AI: " + generateAIReasoning(stats, suggestedMin, riskLevel))
                .expectedMonthlyUsage(stats.getMonthlyAverage())
                .build();
    }

    private String generateAIReasoning(PartUsageStats stats, int suggestedMin, String riskLevel) {
        return String.format("Nhu cầu TB %.1f/tháng, biến động %d-%d, rủi ro %s",
                stats.getMonthlyAverage(), stats.getMinUsage(), stats.getMaxUsage(), riskLevel);
    }

    private String extractReasoning(String aiResponse) {
        // Trích xuất lý do từ phản hồi AI
        if (aiResponse.length() > 300) {
            return aiResponse.substring(0, Math.min(aiResponse.length(), 500)) + "...";
        }
        return aiResponse;
    }

    // Các utility methods giữ nguyên...
    private int calculateSuggestedMinStock(PartUsageStats stats, PartUsageData usageData) {
        double monthlyUsage = stats.getMonthlyAverage();
        double dailyUsage = monthlyUsage / 30;
        int safetyDays = usageData.getAvgDeliveryDays() + 7;
        return (int) Math.ceil(dailyUsage * safetyDays);
    }

    private int calculateReorderPoint(PartUsageStats stats, int suggestedMin) {
        return (int) Math.ceil(suggestedMin * 0.3);
    }

    private String calculateRiskLevel(PartUsageStats stats, PartUsageData usageData) {
        double usageVariability = (stats.getMaxUsage() - stats.getMinUsage()) / (double) stats.getMonthlyAverage();
        if (usageVariability > 0.5 || stats.getUsageFrequency() < 3) return "CAO";
        else if (usageVariability > 0.2) return "TRUNG BÌNH";
        else return "THẤP";
    }

    private AIPartSuggestionResponse generateRuleBasedSuggestions(PartUsageData usageData) {
        log.info("Generating rule-based part suggestions");
        List<AIPartSuggestionResponse.PartSuggestion> suggestions = new ArrayList<>();

        for (PartUsageStats stats : usageData.getPartUsageStats()) {
            int suggestedMin = calculateRuleBasedMinStock(stats, usageData);
            int reorderPoint = (int) Math.ceil(suggestedMin * 0.3);
            String riskLevel = calculateRiskLevel(stats, usageData);

            suggestions.add(AIPartSuggestionResponse.PartSuggestion.builder()
                    .partId(stats.getPartId())
                    .partName(stats.getPartName())
                    .suggestedMinStock(suggestedMin)
                    .suggestedMaxStock((int)(suggestedMin * 1.5))
                    .reorderPoint(reorderPoint)
                    .riskLevel(riskLevel)
                    .reasoning("Đề xuất dựa trên quy tắc quản lý tồn kho cơ bản")
                    .expectedMonthlyUsage(stats.getMonthlyAverage())
                    .build());
        }

        return AIPartSuggestionResponse.builder()
                .centerId(usageData.getCenterId())
                .generatedDate(LocalDate.now())
                .suggestions(suggestions)
                .reasoning("Đề xuất được tạo dựa trên quy tắc quản lý tồn kho (AI tạm thời không khả dụng)")
                .confidenceScore(0.7)
                .build();
    }

    private int calculateRuleBasedMinStock(PartUsageStats stats, PartUsageData usageData) {
        double monthlyUsage = stats.getMonthlyAverage();
        double leadTimeDemand = monthlyUsage * (usageData.getAvgDeliveryDays() / 30.0);
        double safetyStock = monthlyUsage * 0.3;
        return (int) Math.ceil(leadTimeDemand + safetyStock);
    }

    public AIPartSuggestionResponse generateQuickSuggestions(Integer centerId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(3);
        return generatePartSuggestions(centerId, startDate, endDate);
    }
}