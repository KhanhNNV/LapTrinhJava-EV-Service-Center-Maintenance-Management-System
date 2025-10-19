package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.ConversationDto;
import edu.uth.evservice.EVService.model.Conversation;
import edu.uth.evservice.EVService.repositories.IConversationRepository;
import edu.uth.evservice.EVService.requests.CreateConversationRequest;
import edu.uth.evservice.EVService.services.IConversationService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class ConversationService implements IConversationService {
    IConversationRepository conversationRepository;

    @Override
    public List<ConversationDto> getAllConversations() {
        return conversationRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ConversationDto getConversationById(Integer id) {
        return conversationRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public ConversationDto createConversation(CreateConversationRequest request) {
        Conversation conversation = new Conversation();
        conversation.setStatus(request.getStatus());
        conversation.setTopic(request.getTopic());
        conversation.setStartTime(request.getStartTime());
        conversation.setUserId(request.getUserId());
        conversation.setUserId(request.getUserId());

        Conversation saved = conversationRepository.save(conversation);
        return toDto(saved);
    }

    @Override
    public ConversationDto updateConversation(Integer id, CreateConversationRequest request) {
        return conversationRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(request.getStatus());
                    existing.setTopic(request.getTopic());
                    existing.setStartTime(request.getStartTime());
                    existing.setUserId(request.getUserId());
                    existing.setUserId(request.getUserId());
                    Conversation updated = conversationRepository.save(existing);
                    return toDto(updated);
                })
                .orElse(null);
    }

    @Override
    public void deleteConversation(Integer id) {
        conversationRepository.deleteById(id);
    }

    private ConversationDto toDto(Conversation conversation) {
        ConversationDto dto = new ConversationDto();
        dto.setConversationId(conversation.getConversationId());
        dto.setStatus(conversation.getStatus());
        dto.setTopic(conversation.getTopic());
        dto.setStartTime(conversation.getStartTime());
        dto.setUserId(conversation.getUserId());
        dto.setUserId(conversation.getUserId());
        return dto;
    }
}
