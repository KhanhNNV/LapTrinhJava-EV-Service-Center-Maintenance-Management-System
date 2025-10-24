package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import edu.uth.evservice.EVService.model.enums.ConversationStatus;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conversation_id")
    Integer conversationId;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    ConversationStatus status;

    @Column(name = "topic", nullable = false, length = 30)
    private String topic;

    @Column(name = "start_time", nullable = false)
     private LocalDate startTime;
//    private LocalDateTime startTime; // đề xuất Đổi kiểu dữ liệu

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", referencedColumnName = "user_id",nullable = false)
    private User customerConversation; // người gửi yêu cầu (khách hàng)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id",referencedColumnName = "user_id")
    private User staffConversation; // nhân viên hỗ trợ

    @Builder.Default
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();
}
