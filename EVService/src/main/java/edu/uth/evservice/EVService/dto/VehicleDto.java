package edu.uth.evservice.EVService.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VehicleDto {
    private Integer vehicleId;
    private String model;
    private String brand;
    private String licensePlate;
    private LocalDate recentMaintenanceDate;

    private Integer customerId;
    private String customerName;

    private Integer serviceCenterId;
    private String serviceCenterName;
}
