package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.ai.AIPartSuggestionResponse;
import edu.uth.evservice.services.ai.PartDemandAIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/ai/inventory")
@RequiredArgsConstructor
@Tag(name = "AI Inventory Management", description = "APIs for AI-powered inventory suggestions")
public class AISuggestionController {

    private final PartDemandAIService partDemandAIService;

    @Operation(summary = "Get AI part suggestions for service center")
    @GetMapping("/suggestions/{centerId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<AIPartSuggestionResponse> getPartSuggestions(
            @PathVariable Integer centerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        AIPartSuggestionResponse response =
                partDemandAIService.generatePartSuggestions(centerId, startDate, endDate);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get quick AI suggestions for current month")
    @GetMapping("/suggestions/{centerId}/quick")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<AIPartSuggestionResponse> getQuickSuggestions(
            @PathVariable Integer centerId) {

        AIPartSuggestionResponse response =
                partDemandAIService.generateQuickSuggestions(centerId);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Test AI service connectivity")
    @GetMapping("/test")
    public ResponseEntity<String> testAIService() {
        return ResponseEntity.ok("AI Inventory Service is running");
    }
}