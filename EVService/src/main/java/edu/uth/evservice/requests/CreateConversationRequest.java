package edu.uth.evservice.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateConversationRequest {
    private String status;
    private String topic;
    private LocalDate startTime;
    private Integer customerId;
    private Integer employeeId;
}
