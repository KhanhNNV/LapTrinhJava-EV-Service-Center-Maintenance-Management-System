package edu.uth.evservice.dtos;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;
import edu.uth.evservice.models.enums.VehicleType;

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
    private VehicleType vehicleType;
}
