package edu.uth.evservice.EVService.requests;

import java.time.LocalDateTime;

import edu.uth.evservice.EVService.model.Message.SenderType;
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
    private Integer senderId;
    private SenderType senderType;
    private String content;
    private Integer conversationId;
    private LocalDateTime timestamp;
}
