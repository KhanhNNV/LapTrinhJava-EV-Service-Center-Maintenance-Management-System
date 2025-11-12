package edu.uth.evservice.controllers;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.dtos.MessageDto;
import edu.uth.evservice.requests.CreateMessageRequest;
import edu.uth.evservice.services.IMessageService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/messages")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageController {
    private final IMessageService messageService;

    @GetMapping
    public List<MessageDto> getMessages() {
        return messageService.getAllMessages();
    }

    @GetMapping("/conversation/{conversationId}")
    public List<MessageDto> getByConversation(@PathVariable Integer conversationId) {
        return messageService.getMessagesByConversation(conversationId);
    }

    @GetMapping("/{id}")
    public MessageDto getMessageById(@PathVariable Integer id) {
        return messageService.getMessageById(id);
    }

    @PostMapping
    public MessageDto createMessage(@Validated @RequestBody CreateMessageRequest request, Authentication authentication) {
        // Lấy username của người đang đăng nhập từ "vé" JWT
        Integer customerId = Integer.parseInt(authentication.getName());
        // Gọi service và truyền thêm username vào
        return messageService.createMessage(request, customerId);
    }

    @PutMapping("/{id}")
    public MessageDto updateMessage(@PathVariable Integer id, @Validated @RequestBody CreateMessageRequest request) {
        return messageService.updateMessage(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Integer id) {
        messageService.deleteMessage(id);
    }
}
