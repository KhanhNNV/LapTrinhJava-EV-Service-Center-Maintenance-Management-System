package edu.uth.evservice.services.ai;

import edu.uth.evservice.dtos.ai.AIServiceItemSuggestion;
import edu.uth.evservice.models.*;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.repositories.IServiceTicketRepository;
import edu.uth.evservice.repositories.IServiceItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceItemAIService {

    private final ChatClient chatClient;
    private final IServiceTicketRepository ticketRepository;
    private final IServiceItemRepository serviceItemRepository;

    /**
     * Phân tích dữ liệu lịch sử để học patterns giữa ServiceItem và Parts
     */
    public ServiceItemPatternAnalysis analyzeServiceItemPatterns(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Analyzing service item patterns for center {} from {} to {}", startDate, endDate);

        // Lấy tất cả completed tickets trong khoảng thời gian
        List<ServiceTicket> completedTickets = ticketRepository
                .findByStatusAndEndTimeBetween(
                        ServiceTicketStatus.COMPLETED, startDate, endDate);

        log.info("Found {} completed tickets for analysis", completedTickets.size());

        // Phân tích patterns
        Map<ServiceItem, List<PartUsage>> itemPartPatterns = analyzeItemPartRelationships(completedTickets);
        Map<String, Double> itemCoOccurrence = analyzeItemCoOccurrence(completedTickets);

        log.info("Analysis completed. Found patterns for {} service items", itemPartPatterns.size());

        return ServiceItemPatternAnalysis.builder()
                .analysisDate(LocalDateTime.now())
                .itemPartPatterns(itemPartPatterns)
                .itemCoOccurrence(itemCoOccurrence)
                .totalTicketsAnalyzed(completedTickets.size())
                .build();
    }

    /**
     * Phân tích mối quan hệ giữa ServiceItems và Parts
     */
    private Map<ServiceItem, List<PartUsage>> analyzeItemPartRelationships(List<ServiceTicket> tickets) {
        Map<ServiceItem, List<PartUsage>> patterns = new HashMap<>();

        int ticketsWithItemsAndParts = 0;

        for (ServiceTicket ticket : tickets) {
            boolean hasItems = ticket.getTicketServiceItems() != null && !ticket.getTicketServiceItems().isEmpty();
            boolean hasParts = ticket.getTicketParts() != null && !ticket.getTicketParts().isEmpty();

            if (hasItems && hasParts) {
                ticketsWithItemsAndParts++;

                for (TicketServiceItem ticketServiceItem : ticket.getTicketServiceItems()) {
                    ServiceItem serviceItem = ticketServiceItem.getServiceItem();
                    List<PartUsage> partUsages = patterns.getOrDefault(serviceItem, new ArrayList<>());

                    // Tìm parts được sử dụng cùng với service item này
                    for (TicketPart ticketPart : ticket.getTicketParts()) {
                        Part part = ticketPart.getPart();

                        // Tìm hoặc tạo PartUsage
                        Optional<PartUsage> existingUsage = partUsages.stream()
                                .filter(pu -> pu.getPart().getPartId().equals(part.getPartId()))
                                .findFirst();

                        if (existingUsage.isPresent()) {
                            existingUsage.get().incrementUsage(ticketPart.getQuantity());
                        } else {
                            partUsages.add(PartUsage.builder()
                                    .part(part)
                                    .totalQuantityUsed(ticketPart.getQuantity())
                                    .usageCount(1)
                                    .build());
                        }
                    }

                    patterns.put(serviceItem, partUsages);
                }
            }
        }

        log.info("Found {} tickets with both service items and parts", ticketsWithItemsAndParts);
        return patterns;
    }

    /**
     * Phân tích các ServiceItems thường xuất hiện cùng nhau
     */
    private Map<String, Double> analyzeItemCoOccurrence(List<ServiceTicket> tickets) {
        Map<String, Integer> coOccurrenceCount = new HashMap<>();
        Map<String, Integer> itemFrequency = new HashMap<>();

        for (ServiceTicket ticket : tickets) {
            if (ticket.getTicketServiceItems() != null) {
                List<ServiceItem> itemsInTicket = ticket.getTicketServiceItems().stream()
                        .map(TicketServiceItem::getServiceItem)
                        .collect(Collectors.toList());

                // Đếm tần suất từng item
                for (ServiceItem item : itemsInTicket) {
                    itemFrequency.merge(item.getItemName(), 1, Integer::sum);
                }

                // Đếm co-occurrence
                for (int i = 0; i < itemsInTicket.size(); i++) {
                    for (int j = i + 1; j < itemsInTicket.size(); j++) {
                        String pair = itemsInTicket.get(i).getItemName() + "|" + itemsInTicket.get(j).getItemName();
                        coOccurrenceCount.merge(pair, 1, Integer::sum);
                    }
                }
            }
        }

        // Tính tỷ lệ co-occurrence
        Map<String, Double> coOccurrenceRates = new HashMap<>();
        for (Map.Entry<String, Integer> entry : coOccurrenceCount.entrySet()) {
            String[] items = entry.getKey().split("\\|");
            int minFrequency = Math.min(
                    itemFrequency.getOrDefault(items[0], 1),
                    itemFrequency.getOrDefault(items[1], 1)
            );
            double rate = (double) entry.getValue() / minFrequency;
            coOccurrenceRates.put(entry.getKey(), rate);
        }

        return coOccurrenceRates;
    }

    /**
     * Sử dụng AI để đề xuất parts cho một ServiceItem dựa trên patterns
     */
    public AIServiceItemSuggestion generateAISuggestionsForServiceItem(Integer serviceItemId) {
        ServiceItem serviceItem = serviceItemRepository.findById(serviceItemId)
                .orElseThrow(() -> new RuntimeException("ServiceItem not found with ID: " + serviceItemId));

        log.info("Generating AI suggestions for service item: {} (ID: {})", serviceItem.getItemName(), serviceItemId);

        // Phân tích dữ liệu 6 tháng gần nhất
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(6);

        ServiceItemPatternAnalysis analysis = analyzeServiceItemPatterns(startDate, endDate);
        List<PartUsage> historicalPatterns = analysis.getItemPartPatterns().getOrDefault(serviceItem, new ArrayList<>());

        log.info("Found {} historical patterns for service item {}", historicalPatterns.size(), serviceItem.getItemName());

        // Nếu không có dữ liệu lịch sử, sử dụng AI để đề xuất dựa trên mô tả
        if (historicalPatterns.isEmpty()) {
            log.info("No historical data found. Using AI for generic suggestions based on service item description.");
            return generateGenericAISuggestions(serviceItem);
        }

        // Sử dụng AI để đề xuất dựa trên patterns
        try {
            String prompt = buildSuggestionPrompt(serviceItem, historicalPatterns, analysis);

            log.debug("Sending prompt to AI for service item: {}", serviceItem.getItemName());

            String aiResponse = chatClient.prompt()
                    .system("""
                        Bạn là chuyên gia dịch vụ xe điện. Phân tích dữ liệu lịch sử để đề xuất phụ tùng phù hợp cho dịch vụ.
                        Nguyên tắc:
                        - Dựa trên patterns lịch sử thực tế
                        - Đề xuất số lượng hợp lý
                        - Giải thích rõ ràng lý do
                        - Trả lời bằng tiếng Việt
                        """)
                    .user(prompt)
                    .call()
                    .content();

            return parseAISuggestions(serviceItem, historicalPatterns, aiResponse, analysis);

        } catch (Exception e) {
            log.error("AI suggestion failed, using rule-based fallback: {}", e.getMessage());
            return generateRuleBasedSuggestions(serviceItem, historicalPatterns, analysis);
        }
    }

    /**
     * Tạo gợi ý chung dựa trên mô tả service item khi không có dữ liệu lịch sử
     */
    private AIServiceItemSuggestion generateGenericAISuggestions(ServiceItem serviceItem) {
        try {
            String prompt = """
                Dựa trên kiến thức chuyên môn về xe điện, hãy đề xuất các phụ tùng có thể cần thiết cho dịch vụ: "%s"
                Mô tả: %s
                
                Hãy đề xuất 3-5 phụ tùng phổ biến nhất cho dịch vụ này, bao gồm:
                1. Tên phụ tùng
                2. Số lượng ước tính
                3. Mức độ quan trọng
                4. Lý do đề xuất
                
                Trả lời bằng tiếng Việt.
                """.formatted(serviceItem.getItemName(),
                    serviceItem.getDescription() != null ? serviceItem.getDescription() : "Không có mô tả");

            String aiResponse = chatClient.prompt()
                    .system("Bạn là chuyên gia dịch vụ xe điện. Đề xuất phụ tùng dựa trên kiến thức chuyên môn.")
                    .user(prompt)
                    .call()
                    .content();

            return AIServiceItemSuggestion.builder()
                    .serviceItemId(serviceItem.getItemId())
                    .serviceItemName(serviceItem.getItemName())
                    .serviceItemDescription(serviceItem.getDescription())
                    .suggestions(new ArrayList<>()) // Không có suggestions cụ thể
                    .aiReasoning("Không có dữ liệu lịch sử. " + aiResponse)
                    .totalSuggestions(0)
                    .overallConfidenceScore(0.3)
                    .generatedDate(LocalDateTime.now())
                    .historicalDataSize(0)
                    .analysisPeriod("Không có dữ liệu lịch sử")
                    .build();

        } catch (Exception e) {
            log.error("Generic AI suggestion failed: {}", e.getMessage());
            return createEmptySuggestion(serviceItem, "Không thể tạo gợi ý do thiếu dữ liệu lịch sử và lỗi AI.");
        }
    }

    /**
     * Tạo suggestion rỗng với thông báo
     */
    private AIServiceItemSuggestion createEmptySuggestion(ServiceItem serviceItem, String message) {
        return AIServiceItemSuggestion.builder()
                .serviceItemId(serviceItem.getItemId())
                .serviceItemName(serviceItem.getItemName())
                .serviceItemDescription(serviceItem.getDescription())
                .suggestions(new ArrayList<>())
                .aiReasoning(message)
                .totalSuggestions(0)
                .overallConfidenceScore(0.0)
                .generatedDate(LocalDateTime.now())
                .historicalDataSize(0)
                .analysisPeriod("Không có dữ liệu")
                .build();
    }


    private String buildSuggestionPrompt(ServiceItem serviceItem, List<PartUsage> historicalPatterns, ServiceItemPatternAnalysis analysis) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("PHÂN TÍCH ĐỀ XUẤT PHỤ TÙNG CHO DỊCH VỤ\n\n");

        prompt.append("## DỊCH VỤ CẦN PHÂN TÍCH:\n");
        prompt.append("- Tên: ").append(serviceItem.getItemName()).append("\n");
        prompt.append("- Mô tả: ").append(serviceItem.getDescription() != null ? serviceItem.getDescription() : "Không có mô tả").append("\n\n");

        prompt.append("## DỮ LIỆU LỊCH SỬ SỬ DỤNG PHỤ TÙNG:\n");
        if (historicalPatterns.isEmpty()) {
            prompt.append("- Không có dữ liệu lịch sử cho dịch vụ này\n");
        } else {
            for (PartUsage usage : historicalPatterns) {
                prompt.append(String.format("- %s: Sử dụng %d lần, Tổng số lượng: %d, TB: %.1f/lần\n",
                        usage.getPart().getPartName(),
                        usage.getUsageCount(),
                        usage.getTotalQuantityUsed(),
                        usage.getAverageQuantity()));
            }
        }

        prompt.append("\n## THÔNG TIN THỐNG KÊ:\n");
        prompt.append("- Tổng số tickets phân tích: ").append(analysis.getTotalTicketsAnalyzed()).append("\n");

        prompt.append("\n## YÊU CẦU:\n");
        prompt.append("Đề xuất phụ tùng cần thiết cho dịch vụ này:\n");
        prompt.append("1. Liệt kê các phụ tùng được sử dụng phổ biến\n");
        prompt.append("2. Đề xuất số lượng cho từng phụ tùng\n");
        prompt.append("3. Đánh giá mức độ quan trọng (CAO/TRUNG_BÌNH/THẤP)\n");
        prompt.append("4. Giải thích ngắn gọn lý do đề xuất\n");

        return prompt.toString();
    }

    private AIServiceItemSuggestion parseAISuggestions(ServiceItem serviceItem, List<PartUsage> historicalPatterns,
                                                       String aiResponse, ServiceItemPatternAnalysis analysis) {
        List<AIServiceItemSuggestion.PartSuggestion> suggestions = new ArrayList<>();

        // Phân tích patterns để tạo suggestions cơ bản
        for (PartUsage usage : historicalPatterns) {
            if (usage.getUsageCount() >= 1) { // Chỉ đề xuất parts được sử dụng ít nhất 1 lần
                int suggestedQuantity = calculateSuggestedQuantity(usage);
                String importance = calculateImportance(usage);
                double confidence = calculateConfidence(usage);

                suggestions.add(AIServiceItemSuggestion.PartSuggestion.builder()
                        .partId(usage.getPart().getPartId())
                        .partName(usage.getPart().getPartName())
                        .suggestedQuantity(suggestedQuantity)
                        .importanceLevel(importance)
                        .confidenceScore(confidence)
                        .reasoning(generateReasoning(usage))
                        .historicalUsageCount(usage.getUsageCount())
                        .historicalTotalQuantity(usage.getTotalQuantityUsed())
                        .historicalAverageQuantity(usage.getAverageQuantity())
                        .usageRate(calculateUsageRate(usage, analysis.getTotalTicketsAnalyzed()))
                        .currentUnitPrice(usage.getPart().getUnitPrice())
                        .estimatedCost(usage.getPart().getUnitPrice() * suggestedQuantity)
                        .isMandatory(importance.equals("CAO"))
                        .commonlyUsedWith(new ArrayList<>()) // Có thể bổ sung sau
                        .build());
            }
        }

        // Sắp xếp theo confidence score giảm dần
        suggestions.sort((s1, s2) -> Double.compare(s2.getConfidenceScore(), s1.getConfidenceScore()));

        return AIServiceItemSuggestion.builder()
                .serviceItemId(serviceItem.getItemId())
                .serviceItemName(serviceItem.getItemName())
                .serviceItemDescription(serviceItem.getDescription())
                .suggestions(suggestions)
                .aiReasoning(aiResponse)
                .totalSuggestions(suggestions.size())
                .overallConfidenceScore(calculateOverallConfidence(suggestions))
                .generatedDate(LocalDateTime.now())
                .historicalDataSize(analysis.getTotalTicketsAnalyzed())
                .analysisPeriod("6 tháng gần nhất")
                .build();
    }

    private int calculateSuggestedQuantity(PartUsage usage) {
        double average = usage.getAverageQuantity();
        // Làm tròn lên và thêm buffer nhỏ
        return (int) Math.ceil(average * 1.1);
    }

    private String calculateImportance(PartUsage usage) {
        if (usage.getUsageCount() >= 5) return "CAO";
        else if (usage.getUsageCount() >= 2) return "TRUNG_BÌNH";
        else return "THẤP";
    }

    private double calculateConfidence(PartUsage usage) {
        // Confidence dựa trên số lần sử dụng
        return Math.min(1.0, usage.getUsageCount() / 10.0);
    }

    private double calculateUsageRate(PartUsage usage, int totalTickets) {
        return totalTickets > 0 ? (double) usage.getUsageCount() / totalTickets : 0.0;
    }

    private double calculateOverallConfidence(List<AIServiceItemSuggestion.PartSuggestion> suggestions) {
        if (suggestions.isEmpty()) return 0.0;

        return suggestions.stream()
                .mapToDouble(s -> s.getConfidenceScore() != null ? s.getConfidenceScore() : 0.0)
                .average()
                .orElse(0.0);
    }

    private String generateReasoning(PartUsage usage) {
        return String.format("Được sử dụng %d lần với số lượng trung bình %.1f",
                usage.getUsageCount(), usage.getAverageQuantity());
    }


    private AIServiceItemSuggestion generateRuleBasedSuggestions(ServiceItem serviceItem, List<PartUsage> historicalPatterns, ServiceItemPatternAnalysis analysis) {
        List<AIServiceItemSuggestion.PartSuggestion> suggestions = historicalPatterns.stream()
                .filter(usage -> usage.getUsageCount() >= 1)
                .map(usage -> AIServiceItemSuggestion.PartSuggestion.builder()
                        .partId(usage.getPart().getPartId())
                        .partName(usage.getPart().getPartName())
                        .suggestedQuantity((int) Math.ceil(usage.getAverageQuantity()))
                        .importanceLevel("TRUNG_BÌNH")
                        .confidenceScore(0.6)
                        .reasoning("Đề xuất dựa trên dữ liệu lịch sử")
                        .historicalUsageCount(usage.getUsageCount())
                        .historicalTotalQuantity(usage.getTotalQuantityUsed())
                        .historicalAverageQuantity(usage.getAverageQuantity())
                        .usageRate(calculateUsageRate(usage, analysis.getTotalTicketsAnalyzed()))
                        .currentUnitPrice(usage.getPart().getUnitPrice())
                        .estimatedCost(usage.getPart().getUnitPrice() * (int) Math.ceil(usage.getAverageQuantity()))
                        .isMandatory(false)
                        .commonlyUsedWith(new ArrayList<>())
                        .build())
                .collect(Collectors.toList());

        return AIServiceItemSuggestion.builder()
                .serviceItemId(serviceItem.getItemId())
                .serviceItemName(serviceItem.getItemName())
                .serviceItemDescription(serviceItem.getDescription())
                .suggestions(suggestions)
                .aiReasoning("Đề xuất dựa trên phân tích rule-based (AI tạm thời không khả dụng)")
                .totalSuggestions(suggestions.size())
                .overallConfidenceScore(0.6)
                .generatedDate(LocalDateTime.now())
                .historicalDataSize(analysis.getTotalTicketsAnalyzed())
                .analysisPeriod("6 tháng gần nhất")
                .build();
    }

    /**
     * Tự động cập nhật suggestions vào database khi có đủ dữ liệu
     */
    public void autoUpdateServiceItemSuggestions() {

        List<ServiceItem> allServiceItems = serviceItemRepository.findAll();
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(3); // Phân tích 3 tháng gần nhất

        ServiceItemPatternAnalysis analysis = analyzeServiceItemPatterns(startDate, endDate);

        for (ServiceItem serviceItem : allServiceItems) {
            List<PartUsage> patterns = analysis.getItemPartPatterns().getOrDefault(serviceItem, new ArrayList<>());
            if (!patterns.isEmpty()) {
                AIServiceItemSuggestion suggestion = generateAISuggestionsForServiceItem(serviceItem.getItemId());
                log.info("Auto-generated {} suggestions for service item: {}",
                        suggestion.getTotalSuggestions(), serviceItem.getItemName());

                // Ở đây bạn có thể lưu suggestions vào database
                // serviceItemSuggestionRepository.save(suggestion);
            }
        }
    }
}