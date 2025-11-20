package edu.uth.evservice.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Integer notificationId;
    private Integer userId;
    private String title;
    private String message;
   @JsonProperty("isRead") //Bắt buộc JSON trả về tên là "isRead"
    private boolean isRead;
    private LocalDateTime createdAt;
}