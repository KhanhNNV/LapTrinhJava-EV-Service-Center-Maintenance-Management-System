package edu.uth.evservice.EVService.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeNotiRequest {
    private int employeeId;
    private String title;
    private String message;
}
