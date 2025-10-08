package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.ConversationDto;
import edu.uth.evservice.EVService.requests.CreateConversationRequest;
import edu.uth.evservice.EVService.services.IConversationService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/conversations")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    IConversationService conversationService;

    @GetMapping
    public List<ConversationDto> getConversations() {
        return conversationService.getAllConversations();
    }

    @GetMapping("/{id}")
    public ConversationDto getConversationById(@PathVariable Integer id) {
        return conversationService.getConversationById(id);
    }

    @PostMapping
    public ConversationDto createConversation(@RequestBody CreateConversationRequest request) {
        return conversationService.createConversation(request);
    }

    @PutMapping("/{id}")
    public ConversationDto updateConversation(@PathVariable Integer id, @RequestBody CreateConversationRequest request) {
        return conversationService.updateConversation(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteConversation(@PathVariable Integer id) {
        conversationService.deleteConversation(id);
    }
}
