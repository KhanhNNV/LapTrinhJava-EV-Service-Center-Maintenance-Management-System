package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationDto {
    private Integer conversationId;
    private String status;
    private String topic;
    private LocalDate startTime;
    private Integer customerId;
    private Integer employeeId;
}
