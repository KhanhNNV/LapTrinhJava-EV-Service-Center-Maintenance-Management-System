package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleDto {
    Integer vehicleId;
    String model;
    String brand;
    String licensePlate;
    LocalDate recentMaintenanceDate;
    Integer userId;
    Integer centerId;
}
