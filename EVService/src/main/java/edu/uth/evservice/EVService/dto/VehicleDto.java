package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;
import edu.uth.evservice.EVService.model.enums.VehicleType;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleDto {
    private Integer vehicleId;
    private String model;
    private String brand;
    private String licensePlate;
    private LocalDate recentMaintenanceDate;
    private Integer userId;
    private Integer centerId;
    private VehicleType vehicleType;
}
