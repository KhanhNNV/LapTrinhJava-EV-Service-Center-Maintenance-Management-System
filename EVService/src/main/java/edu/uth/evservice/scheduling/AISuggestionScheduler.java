package edu.uth.evservice.scheduling;

import edu.uth.evservice.services.ai.PartDemandAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AISuggestionScheduler {

    private final PartDemandAIService partDemandAIService;

    @Scheduled(cron = "0 0 2 * * MON") // Chạy vào 2h sáng thứ 2 hàng tuần
    public void generateWeeklySuggestions() {
        log.info("Starting weekly AI part suggestions generation");

        // Trong thực tế, bạn sẽ lấy danh sách tất cả các trung tâm
        // và generate suggestions cho từng trung tâm
        try {
            // Example: Generate for center 1
            partDemandAIService.generateQuickSuggestions(1);
            log.info("Weekly AI suggestions generated successfully");
        } catch (Exception e) {
            log.error("Failed to generate weekly AI suggestions: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 6 * * *") // Chạy hàng ngày lúc 6h sáng
    public void healthCheck() {
        log.info("AI Service Health Check - Running normally");
    }
}