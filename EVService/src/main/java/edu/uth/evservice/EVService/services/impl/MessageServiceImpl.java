package edu.uth.evservice.EVService.services.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import edu.uth.evservice.EVService.model.enums.ConversationStatus;
import edu.uth.evservice.EVService.model.enums.Role;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.MessageDto;
import edu.uth.evservice.EVService.model.Conversation;
import edu.uth.evservice.EVService.model.Message;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.repositories.IConversationRepository;
import edu.uth.evservice.EVService.repositories.IMessageRepository;
import edu.uth.evservice.EVService.repositories.IUserRepository;
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
    IConversationRepository conversationRepository;
    IUserRepository userRepository;

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
        return messageRepository.findByConversation_ConversationId(conversationId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

//    @Override
//    public MessageDto createMessage(CreateMessageRequest request) {
//        Conversation conversation = conversationRepository.findById(request.getConversationId())
//                .orElseThrow(() -> new EntityNotFoundException(
//                        "Conversation not found with id: " + request.getConversationId()));
//        Message m = new Message();
//        // resolve sender user
//        if (request.getSenderId() == null) {
//            throw new IllegalArgumentException("senderId is required");
//        }
//        User sender = userRepository.findById(request.getSenderId())
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getSenderId()));
//        m.setUser(sender);
//        m.setIsRead(request.getIsRead() != null ? request.getIsRead() : Boolean.FALSE);
//        m.setContent(request.getContent());
//        m.setConversation(conversation);
//        m.setTimestamp(request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now());
//
//        Message saved = messageRepository.save(m);
//        return toDto(saved);
//    }
@Override
@Transactional // Đảm bảo tất cả các bước (kiểm tra, cập nhật, tạo) là một giao dịch
public MessageDto createMessage(CreateMessageRequest request, String username) {
    // 1. TÌM NGƯỜI GỬI BẰNG USERNAME TỪ JWT (An toàn)
    User sender = userRepository.findByUsername(username)
            .orElseThrow(() -> new EntityNotFoundException("User (Sender) not found with username: " + username));

    Conversation conversation; // Chuẩn bị "phòng chat"

    // 2. KIỂM TRA ID CUỘC TRÒ CHUYỆN
    if (request.getConversationId() == null) {
        // === TRƯỜNG HỢP 1: TIN NHẮN MỚI (TẠO PHÒNG CHAT MỚI) ===

        // Chỉ khách hàng mới được tạo phòng chat mới
        if (sender.getRole() != Role.CUSTOMER) {
            throw new SecurityException("Only customers can create a new conversation.");
        }

        Conversation newConversation = Conversation.builder()
                .customerConversation(sender)
                .staffConversation(null)
                .status(ConversationStatus.NEW)
                .topic("Yêu cầu hỗ trợ mới từ " + sender.getFullName())
                .startTime(LocalDate.now()) // Dùng LocalDateTime
                .build();

        conversation = conversationRepository.save(newConversation);

    } else {
        // === TRƯỜNG HỢP 2: TIN NHẮN VÀO PHÒNG CHAT ĐÃ CÓ ===
        conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Conversation not found with id: " + request.getConversationId()));

        // Lấy thông tin người chủ phòng chat và nhân viên phụ trách
        User customer = conversation.getCustomerConversation();
        User assignedStaff = conversation.getStaffConversation();

        // === LOGIC BẢO MẬT MỚI ===
        // 3. KIỂM TRA QUYỀN GỬI TIN NHẮN

        // A. Kiểm tra xem người gửi có phải là khách hàng chủ phòng chat không
        boolean isCustomer = customer.getUsername().equals(username);

        // B. Kiểm tra xem người gửi có phải là nhân viên đã được gán không
        boolean isAssignedStaff = (assignedStaff != null) &&
                (assignedStaff.getUsername().equals(username));

        // NẾU KHÔNG PHẢI CẢ HAI, TỪ CHỐI!
        if (!isCustomer && !isAssignedStaff) {
            throw new SecurityException("You are not authorized to send messages to this conversation.");
        }

        // === LOGIC MỚI: TỰ ĐỘNG "MỞ LẠI" CUỘC TRÒ CHUYỆN ===
        if (conversation.getStatus() == ConversationStatus.CLOSED) {
            // (isCustomer || isAssignedStaff) đã được kiểm tra ở trên, nên ai gửi ở đây đều hợp lệ
            conversation.setStatus(ConversationStatus.IN_PROGRESS);
            conversation = conversationRepository.save(conversation);
        }
    }

    // 5. TẠO VÀ LƯU TIN NHẮN MỚI
    Message newMessage = Message.builder()
            .user(sender)
            .content(request.getContent())
            .conversation(conversation)
            .timestamp(LocalDateTime.now())
            .isRead(false)
            .build();

    Message savedMessage = messageRepository.save(newMessage);

    return toDto(savedMessage);
}

    @Override
    public MessageDto updateMessage(Integer id, CreateMessageRequest request) {
        return messageRepository.findById(id)
                .map(existing -> {
                    if (request.getSenderId() != null) {
                        User sender = userRepository.findById(request.getSenderId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                        "User not found with id: " + request.getSenderId()));
                        existing.setUser(sender);
                    }
                    if (request.getIsRead() != null) {
                        existing.setIsRead(request.getIsRead());
                    }
                    if (request.getContent() != null) {
                        existing.setContent(request.getContent());
                    }
                    if (request.getConversationId() != null) {
                        Conversation conversation = conversationRepository.findById(request.getConversationId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                        "Conversation not found with id: " + request.getConversationId()));
                        existing.setConversation(conversation);
                    }
                    // update timestamp to now to reflect edit time (or use provided timestamp)
                    existing.setTimestamp(
                            request.getTimestamp() != null ? request.getTimestamp() : LocalDateTime.now());
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
        dto.setMessageId(m.getMessageId());
        dto.setIsRead(m.getIsRead());
        dto.setContent(m.getContent());
        dto.setTimestamp(m.getTimestamp());
        dto.setConversationId(m.getConversation() != null ? m.getConversation().getConversationId() : null);
        if (m.getUser() != null) {
            dto.setSenderId(m.getUser().getUserId());
            dto.setSenderName(m.getUser().getFullName());
        }
        return dto;
    }
}
