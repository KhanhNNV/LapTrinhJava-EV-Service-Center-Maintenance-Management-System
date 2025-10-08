package edu.uth.evservice.EVService.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerNotiDTO {
    private int notiId;
    private int customerId;
    private String title;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdAt;
}