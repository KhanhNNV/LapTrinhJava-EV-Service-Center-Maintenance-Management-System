package edu.uth.evservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Slf4j
@Configuration
@Profile("dev")
public class AIConfigCheck {

    @Bean
    public CommandLineRunner checkAIConfig(ChatClient chatClient) {
        return args -> {
            try {
                log.info("🔧 Checking Spring AI Google GenAI configuration...");

                String response = chatClient.prompt()
                        .system("Bạn là trợ lý AI cho trung tâm dịch vụ xe điện. Trả lời ngắn gọn bằng tiếng Việt.")
                        .user("Xác nhận kết nối Google Gemini thành công")
                        .call()
                        .content();

                log.info("✅ Spring AI Google GenAI Configuration successful: {}", response);

            } catch (Exception e) {
                log.error("❌ Spring AI Google GenAI Configuration failed: {}", e.getMessage());
                log.info("💡 Please check:");
                log.info("   - GEMINI_API_KEY in .env file");
                log.info("   - Internet connection");
                log.info("   - Google AI Studio API key permissions");
            }
        };
    }
}