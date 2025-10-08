package edu.uth.evservice.EVService.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.MessageDto;
import edu.uth.evservice.EVService.requests.CreateMessageRequest;
import edu.uth.evservice.EVService.services.IMessageService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/messages")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MessageController {
    IMessageService messageService;

    @GetMapping
    public List<MessageDto> getMessages() {
        return messageService.getAllMessages();
    }

    @GetMapping("/conversation/{conversation_id}")
    public List<MessageDto> getByConversation(@PathVariable Integer conversationId) {
        return messageService.getMessagesByConversation(conversationId);
    }

    @GetMapping("/{id}")
    public MessageDto getMessageById(@PathVariable Integer id) {
        return messageService.getMessageById(id);
    }

    @PostMapping
    public MessageDto createMessage(@RequestBody CreateMessageRequest request) {
        return messageService.createMessage(request);
    }

    @PutMapping("/{id}")
    public MessageDto updateMessage(@PathVariable Integer id, @RequestBody CreateMessageRequest request) {
        return messageService.updateMessage(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Integer id) {
        messageService.deleteMessage(id);
    }
}
