package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.ai.AIServiceItemSuggestion;
import edu.uth.evservice.services.ai.ServiceItemAIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/suggestions")
@RequiredArgsConstructor
@Tag(name = "AI Service Item Suggestions", description = "APIs for AI-powered service item part suggestions")
public class AIServiceItemController {

    private final ServiceItemAIService serviceItemAIService;

    @Operation(summary = "Get AI part suggestions for a service item")
    @GetMapping("/{serviceItemId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'STAFF', 'ADMIN')")
    public ResponseEntity<AIServiceItemSuggestion> getAISuggestionsForServiceItem(
            @PathVariable Integer serviceItemId) {

        AIServiceItemSuggestion suggestions =
                serviceItemAIService.generateAISuggestionsForServiceItem(serviceItemId);

        return ResponseEntity.ok(suggestions);
    }
}