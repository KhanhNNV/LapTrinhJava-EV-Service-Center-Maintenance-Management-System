package edu.uth.evservice.EVService.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleRequest {
    String model;
    String brand;
    String licensePlate;
    LocalDate recentMaintenanceDate;
    Integer userId;
    Integer centerId;
}
