package edu.uth.evservice.EVService.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateConversationRequest {
    private String status;
    private String topic;
    private LocalDate startTime;
//    private LocalDateTime startTime; // đề xuất Đổi kiểu dữ liệu
    private Integer customerId;
    private Integer employeeId;
}
