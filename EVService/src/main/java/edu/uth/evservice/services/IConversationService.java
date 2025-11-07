package edu.uth.evservice.services;

import edu.uth.evservice.dtos.ConversationDto;
import edu.uth.evservice.requests.CreateConversationRequest;

import java.util.List;

public interface IConversationService {
    List<ConversationDto> getAllConversations();
    ConversationDto getConversationById(Integer id);
    ConversationDto createConversation(CreateConversationRequest request);
    ConversationDto updateConversation(Integer id, CreateConversationRequest request);
    void deleteConversation(Integer id);
}
