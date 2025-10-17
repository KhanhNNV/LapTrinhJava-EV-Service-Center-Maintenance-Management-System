package edu.uth.evservice.EVService.dto;

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
    private boolean isRead;
    private LocalDateTime createdAt;
}