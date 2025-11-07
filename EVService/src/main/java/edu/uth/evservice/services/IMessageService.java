package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.MessageDto;
import edu.uth.evservice.requests.CreateMessageRequest;

public interface IMessageService {
    List<MessageDto> getAllMessages();

    MessageDto getMessageById(Integer id);

    List<MessageDto> getMessagesByConversation(Integer conversationId);

    MessageDto createMessage(CreateMessageRequest request);

    MessageDto updateMessage(Integer id, CreateMessageRequest request);

    void deleteMessage(Integer id);
}
