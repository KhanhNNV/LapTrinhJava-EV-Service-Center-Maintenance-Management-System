package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.ConversationDto;
import edu.uth.evservice.requests.CreateConversationRequest;
import edu.uth.evservice.services.IConversationService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
    @PutMapping("/{id}/claim")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')") // Chỉ STAFF hoặc ADMIN mới được dùng
    public ResponseEntity<ConversationDto> claimConversation(@PathVariable Integer id, Authentication authentication) {
        String username = authentication.getName(); // Lấy username của nhân viên đang đăng nhập từ JWT
        ConversationDto updatedConversation = conversationService.claimConversation(id, username);// Gọi service để thực hiện logic
        return ResponseEntity.ok(updatedConversation);
    }
    // === ENDPOINT MỚI ĐỂ ĐÓNG CUỘC TRÒ CHUYỆN ===
    @PutMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')") // Chỉ STAFF hoặc ADMIN mới được dùng
    public ResponseEntity<ConversationDto> closeConversation(
            @PathVariable Integer id,
            Authentication authentication) {

        String staffUsername = authentication.getName();
        ConversationDto updatedConversation = conversationService.closeConversation(id, staffUsername);

        return ResponseEntity.ok(updatedConversation);
    }

}
