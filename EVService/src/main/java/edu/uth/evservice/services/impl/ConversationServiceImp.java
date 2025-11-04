package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.ConversationDto;
import edu.uth.evservice.models.Conversation;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.ConversationStatus;
import edu.uth.evservice.repositories.IConversationRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.CreateConversationRequest;
import edu.uth.evservice.services.IConversationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class ConversationServiceImp  implements IConversationService {
    final IConversationRepository conversationRepository;
    final IUserRepository userRepository;
    

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
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + request.getCustomerId()));
        
        User staff = null;
        if (request.getEmployeeId() != null) {
            staff = userRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new EntityNotFoundException("Staff not found with id: " + request.getEmployeeId()));
        }

        Conversation conversation = Conversation.builder()
                .status(ConversationStatus.valueOf(request.getStatus().toUpperCase()))
                .topic(request.getTopic())
                .startTime(request.getStartTime())
                .customerConversation(customer)
                .staffConversation(staff)
                .build();

        Conversation savedConversation = conversationRepository.save(conversation);
        return toDto(savedConversation);
    }

    @Override
    public ConversationDto updateConversation(Integer id, CreateConversationRequest request) {
        return conversationRepository.findById(id)
                .map(existing -> {
                    User customer = userRepository.findById(request.getCustomerId())
                        .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + request.getCustomerId()));
                    User staff = null;
                    if (request.getEmployeeId() != null) {
                        staff = userRepository.findById(request.getEmployeeId())
                            .orElseThrow(() -> new EntityNotFoundException("Staff not found with id: " + request.getEmployeeId()));
                    }

                    existing.setStatus(ConversationStatus.valueOf(request.getStatus().toUpperCase()));
                    existing.setTopic(request.getTopic());
                    existing.setStartTime(request.getStartTime());
                    existing.setCustomerConversation(customer);
                    existing.setStaffConversation(staff);

                    Conversation updated = conversationRepository.save(existing);
                    return toDto(updated);
                })
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found with id: " + id));
    }

    @Override
    public void deleteConversation(Integer id) {
        conversationRepository.deleteById(id);
    }

    private ConversationDto toDto(Conversation conversation) {
        return new ConversationDto(
            conversation.getConversationId(),
            conversation.getStatus().name(),
            conversation.getTopic(),
            conversation.getStartTime(),
            conversation.getCustomerConversation().getUserId(),
            conversation.getStaffConversation() != null ? conversation.getStaffConversation().getUserId() : null
        );
    }
}
