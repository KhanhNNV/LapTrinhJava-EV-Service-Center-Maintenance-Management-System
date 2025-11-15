package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.ai.AIServiceItemSuggestion;
import edu.uth.evservice.services.ai.ServiceItemAIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/ai/service-items")
@RequiredArgsConstructor
@Tag(name = "AI Service Item Suggestions", description = "APIs for AI-powered service item part suggestions")
public class AIServiceItemController {

    private final ServiceItemAIService serviceItemAIService;

    @Operation(summary = "Get AI part suggestions for a service item")
    @GetMapping("/{serviceItemId}/suggestions")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'STAFF', 'ADMIN')")
    public ResponseEntity<AIServiceItemSuggestion> getAISuggestionsForServiceItem(
            @PathVariable Integer serviceItemId,
            @RequestParam Integer centerId) {

        AIServiceItemSuggestion suggestions =
                serviceItemAIService.generateAISuggestionsForServiceItem(serviceItemId, centerId);

        return ResponseEntity.ok(suggestions);
    }

    @Operation(summary = "Analyze service item patterns")
    @GetMapping("/analysis")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<String> analyzePatterns(
            @RequestParam Integer centerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        serviceItemAIService.analyzeServiceItemPatterns(centerId, startDate, endDate);
        return ResponseEntity.ok("Service item pattern analysis completed");
    }

    @Operation(summary = "Auto-update all service item suggestions")
    @PostMapping("/auto-update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> autoUpdateSuggestions(@RequestParam Integer centerId) {
        serviceItemAIService.autoUpdateServiceItemSuggestions(centerId);
        return ResponseEntity.ok("Auto-update of service item suggestions completed");
    }
}