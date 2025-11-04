package edu.uth.evservice.requests;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CreateMessageRequest {
    private Integer messageId;
    private Boolean isRead;
    private String content;
    private LocalDateTime timestamp;
    private Integer conversationId;
    private Integer senderId;
    private String senderName;
}
