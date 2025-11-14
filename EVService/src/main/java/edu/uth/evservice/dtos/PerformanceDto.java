package edu.uth.evservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceDto {
    private int technicianId;
    private String fullName;
    private int totalTickets;
    private double totalHours;
}
