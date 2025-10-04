package edu.uth.evservice.EVService.respones;

import lombok.*;
import java.time.LocalDateTime;

// Trả dữ liệu về cho client
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private int appointmentId;
    private LocalDateTime appointmentDate;
    private String serviceType;
    private String status;
    private String note;
}