package edu.uth.evservice.dtos;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryDto {
    private Long userId;
    private String fullName;
    private String role;
    private Long baseSalary;
    private Long bonus;
    private Long totalSalary;
}
