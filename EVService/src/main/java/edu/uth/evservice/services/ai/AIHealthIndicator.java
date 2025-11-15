//package edu.uth.evservice.services.ai;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.ai.chat.client.ChatClient;
//import org.springframework.boot.actuate.health.Health;
//import org.springframework.boot.actuate.health.HealthIndicator;
//import org.springframework.stereotype.Component;
//
//@Slf4j
//@Component
//@RequiredArgsConstructor
//public class AIHealthIndicator implements HealthIndicator {
//
//    private final ChatClient chatClient;
//
//    @Override
//    public Health health() {
//        try {
//            long startTime = System.currentTimeMillis();
//            String response = chatClient.prompt()
//                    .user("Say 'OK' in Vietnamese")
//                    .call()
//                    .content();
//            long responseTime = System.currentTimeMillis() - startTime;
//
//            return Health.up()
//                    .withDetail("service", "Spring AI OpenAI")
//                    .withDetail("responseTime", responseTime + "ms")
//                    .withDetail("status", "Connected")
//                    .build();
//
//        } catch (Exception e) {
//            log.error("AI Health check failed: {}", e.getMessage());
//            return Health.down()
//                    .withDetail("service", "Spring AI OpenAI")
//                    .withDetail("error", e.getMessage())
//                    .withDetail("status", "Disconnected")
//                    .build();
//        }
//    }
//}