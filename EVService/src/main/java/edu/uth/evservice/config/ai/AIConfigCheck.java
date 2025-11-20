package edu.uth.evservice.config.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Tự động chạy một lần khi ứng dụng khởi động để kiểm tra xem API key và kết nối AI có hoạt động không
 */

@Slf4j
@Configuration
@Profile("dev")
public class AIConfigCheck {

    @Bean
    @ConditionalOnProperty(
            name = "app.ai.enabled",
            havingValue = "true",
            matchIfMissing = false
    )
    public CommandLineRunner checkAIConfig(ChatClient chatClient) {
        return args -> {
            try {
                log.info("Checking Spring AI Google GenAI configuration...");

                String response = chatClient.prompt()
                        .system("Bạn là trợ lý AI cho trung tâm dịch vụ xe điện. Trả lời ngắn gọn bằng tiếng Việt.")
                        .user("Xác nhận kết nối Google Gemini thành công")
                        .call()
                        .content();

                log.info("Spring AI Google GenAI Configuration successful: {}", response);

            } catch (Exception e) {
                log.error("Spring AI Google GenAI Configuration failed: {}", e.getMessage());
                log.info("Please check:");
                log.info("   - GEMINI_API_KEY in dev.properties file");
                log.info("   - Internet connection");
                log.info("   - Google AI Studio API key permissions");
            }
        };
    }
}