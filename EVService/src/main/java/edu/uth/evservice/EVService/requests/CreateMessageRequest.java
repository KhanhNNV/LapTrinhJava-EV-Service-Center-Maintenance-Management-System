package edu.uth.evservice.EVService.requests;

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
    private Integer senderId;
    private String senderType;
    private String content;
    private Integer conversationId;
    private LocalDateTime timestamp;
}
