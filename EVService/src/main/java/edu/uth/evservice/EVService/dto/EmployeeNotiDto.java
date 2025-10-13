package edu.uth.evservice.EVService.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeNotiDto {
    private Integer notiId; 

    private Integer employeeId; 

    private String title;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdAt;
}
