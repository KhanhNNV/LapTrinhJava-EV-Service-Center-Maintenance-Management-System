package edu.uth.evservice.services.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


import edu.uth.evservice.models.enums.ConversationStatus;
import edu.uth.evservice.models.enums.Role;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import edu.uth.evservice.dtos.MessageDto;
import edu.uth.evservice.models.Conversation;
import edu.uth.evservice.models.Message;
import edu.uth.evservice.models.User;
import edu.uth.evservice.repositories.IConversationRepository;
import edu.uth.evservice.repositories.IMessageRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.CreateMessageRequest;
import edu.uth.evservice.services.IMessageService;
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
@Override
@Transactional // Đảm bảo tất cả các bước (kiểm tra, cập nhật, tạo) là một giao dịch
public MessageDto createMessage(CreateMessageRequest request, String username) {
    // 1. TÌM NGƯỜI GỬI BẰNG USERNAME TỪ JWT
    User sender = userRepository.findByUsername(username)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng (người gửi) với username: " + username));

    Conversation conversation; // Chuẩn bị "phòng chat"

    // 2. KIỂM TRA ID CUỘC TRÒ CHUYỆN
    if (request.getConversationId() == null) {
        // === TRƯỜNG HỢP 1: TIN NHẮN MỚI (TẠO PHÒNG CHAT MỚI) ===
        if (sender.getRole() != Role.CUSTOMER) {
            throw new SecurityException("Chỉ khách hàng mới có thể tạo cuộc trò chuyện mới.");
        }
        Conversation newConversation = Conversation.builder()
                .customerConversation(sender)
                .staffConversation(null)
                .status(ConversationStatus.NEW)
                .topic("Yêu cầu hỗ trợ mới từ " + sender.getFullName())
                .startTime(LocalDate.now()) // <-- Đã sửa lại thành LocalDate.now()
                .build();
        conversation = conversationRepository.save(newConversation);

    } else {
        // === TRƯỜNG HỢP 2: TIN NHẮN VÀO PHÒNG CHAT ĐÃ CÓ ===
        conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy cuộc trò chuyện có id: " + request.getConversationId()));

        User customer = conversation.getCustomerConversation();
        User assignedStaff = conversation.getStaffConversation();
        boolean isCustomer = customer.getUsername().equals(sender.getUsername());
        boolean isAssignedStaff = (assignedStaff != null) &&
                (assignedStaff.getUsername().equals(sender.getUsername()));

        // 3. KIỂM TRA QUYỀN GỬI TIN NHẮN
        if (conversation.getStatus() == ConversationStatus.NEW && !isCustomer) {
            throw new SecurityException("Nhân viên phải xác nhận cuộc trò chuyện này trước khi trả lời.");
        }
        if (conversation.getStatus() == ConversationStatus.IN_PROGRESS && !isCustomer && !isAssignedStaff) {
            throw new SecurityException("Cuộc trò chuyện này đang diễn ra với một nhân viên khác.");
        }
        if (conversation.getStatus() == ConversationStatus.CLOSED && !isCustomer && !isAssignedStaff) {
            throw new SecurityException("Bạn không được phép mở lại cuộc trò chuyện đã đóng này.");
        }

        // === LOGIC MỚI: TỰ ĐỘNG "MỞ LẠI" (ĐÃ CẬP NHẬT) ===
        if (conversation.getStatus() == ConversationStatus.CLOSED) {

            // NẾU LÀ KHÁCH HÀNG NHẮN TIN LẠI
            if (isCustomer) {
                conversation.setStatus(ConversationStatus.NEW);   // <-- Chuyển thành NEW
                conversation.setStaffConversation(null);          // <-- XÓA nhân viên cũ
            }
            // NẾU LÀ NHÂN VIÊN CŨ NHẮN TIN LẠI
            else if (isAssignedStaff) {
                conversation.setStatus(ConversationStatus.IN_PROGRESS); // Giữ nguyên nhân viên
            }
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
