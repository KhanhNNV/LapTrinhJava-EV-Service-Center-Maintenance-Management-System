package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.ai.AIPartSuggestionResponse;
import edu.uth.evservice.services.ai.PartDemandAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/ai/test")
@RequiredArgsConstructor
public class AITestController {

    private final PartDemandAIService partDemandAIService;

    @GetMapping("/suggestions")
    public ResponseEntity<AIPartSuggestionResponse> testSuggestions() {
        // Test với dữ liệu mẫu
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(2);

        AIPartSuggestionResponse response =
                partDemandAIService.generatePartSuggestions(1, startDate, endDate);

        return ResponseEntity.ok(response);
    }
}