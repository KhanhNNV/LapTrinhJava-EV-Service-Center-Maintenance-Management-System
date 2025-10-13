package edu.uth.evservice.EVService.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.MessageDto;
import edu.uth.evservice.EVService.model.Message;
import edu.uth.evservice.EVService.repositories.IMessageRepository;
import edu.uth.evservice.EVService.requests.CreateMessageRequest;
import edu.uth.evservice.EVService.services.IMessageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class MessageServiceImpl implements IMessageService {
    IMessageRepository messageRepository;

    @Override
    public List<MessageDto> getAllMessages() {
        return messageRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MessageDto getMessageById(Integer id) {
        return messageRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Message not found with id: " + id));
    }

    @Override
    public List<MessageDto> getMessagesByConversation(Integer conversationId) {
        if (conversationId == null) {
            throw new IllegalArgumentException("ConversationId cannot be null");
        }
        return messageRepository.findByConversationId(conversationId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public MessageDto createMessage(CreateMessageRequest request) {
        Message m = new Message();
        m.setSenderId(request.getSenderId());
        m.setSenderType(request.getSenderType());
        m.setContent(request.getContent());
        m.setConversationId(request.getConversationId());
        m.setTimestamp(LocalDateTime.now());

        Message saved = messageRepository.save(m);
        return toDto(saved);
    }

    @Override
    public MessageDto updateMessage(Integer id, CreateMessageRequest request) {
        return messageRepository.findById(id)
                .map(existing -> {
                    if (request.getSenderId() != null)
                        existing.setSenderId(request.getSenderId());
                    if (request.getSenderType() != null)
                        existing.setSenderType(request.getSenderType());
                    if (request.getContent() != null)
                        existing.setContent(request.getContent());
                    if (request.getConversationId() != null)
                        existing.setConversationId(request.getConversationId());
                    // update timestamp to now to reflect edit time
                    existing.setTimestamp(LocalDateTime.now());
                    Message updated = messageRepository.save(existing);
                    return toDto(updated);
                })
                .orElse(null);
    }

    @Override
    public void deleteMessage(Integer id) {
        messageRepository.deleteById(id);
    }

    private MessageDto toDto(Message m) {
        MessageDto dto = new MessageDto();
        dto.setId(m.getMessageId());
        dto.setSenderId(m.getSenderId());
        dto.setSenderType(m.getSenderType());
        dto.setContent(m.getContent());
        dto.setTimestamp(m.getTimestamp());
        dto.setConversationId(m.getConversationId());
        return dto;
    }
}
