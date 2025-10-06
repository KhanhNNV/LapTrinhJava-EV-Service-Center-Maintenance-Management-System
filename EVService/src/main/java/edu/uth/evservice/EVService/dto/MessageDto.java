package edu.uth.evservice.EVService.dto;

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
public class MessageDto {
    private Integer id;
    private Integer senderId;
    private String senderType;
    private String content;
    private LocalDateTime timestamp;
    private Integer conversationId;
}
