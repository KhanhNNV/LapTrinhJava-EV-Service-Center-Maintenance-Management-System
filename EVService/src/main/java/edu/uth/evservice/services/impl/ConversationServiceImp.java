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
import org.springframework.transaction.annotation.Transactional;

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
    @Override
    @Transactional
    public ConversationDto claimConversation (Integer conversationId , Integer staffId) {
        //Tim cuoc tro chuyen trong database
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc trò chuyện có id: " + conversationId));
        //  Kiem tra trang thai cuoc tro chuyen
        if(conversation.getStatus() != ConversationStatus.NEW) {
            throw new IllegalArgumentException("Cuộc trò chuyện này không ở trạng thái MỚI nên không thể nhận.");
        }
        // Kiem tra da co ai nhan cuoc tro chuyen chua
        if (conversation.getStaffConversation() != null) {
            throw new IllegalArgumentException("Cuộc trò chuyện này đã có nhân viên khác nhận xử lý.");
        }
        // Tim nhan vien xu ly
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân viên với username: " + staffId));
        // Cap nhap thong tin gan nhan vien vao cuoc tro chuyen
        conversation.setStaffConversation(staff);
        conversation.setStatus(ConversationStatus.IN_PROGRESS);
        Conversation savedConversation = conversationRepository.save(conversation);
        return toDto(savedConversation);
    }
    @Override
    @Transactional
    public ConversationDto closeConversation(Integer conversationId, Integer staffId) {
        // 1. Tìm cuộc trò chuyện trong database
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc trò chuyện có id: " + conversationId));

        // 2. KIỂM TRA QUYỀN SỞ HỮU - RẤT QUAN TRỌNG
        // Đảm bảo có nhân viên phụ trách và nhân viên đó chính là người đang thực hiện hành động
        if (conversation.getStaffConversation() == null ||
                !conversation.getStaffConversation().getUserId().equals(staffId)) {
            // Nếu không có nhân viên nào, hoặc người đóng không phải là người phụ trách
            throw new SecurityException("Bạn không có quyền đóng cuộc trò chuyện này.");
        }

        // 3. Đổi trạng thái sang "Đã đóng"
        conversation.setStatus(ConversationStatus.CLOSED);

        // 4. Lưu lại và trả về kết quả
        Conversation savedConversation = conversationRepository.save(conversation);
        return toDto(savedConversation);
    }
}
