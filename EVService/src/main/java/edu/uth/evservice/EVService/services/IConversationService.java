package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.ConversationDto;
import edu.uth.evservice.EVService.requests.CreateConversationRequest;

import java.util.List;

public interface IConversationService {
    List<ConversationDto> getAllConversations();
    ConversationDto getConversationById(Integer id);
    ConversationDto createConversation(CreateConversationRequest request);
    ConversationDto updateConversation(Integer id, CreateConversationRequest request);
    void deleteConversation(Integer id);
    ConversationDto claimConversation(Integer id , String staffUsername);
}
