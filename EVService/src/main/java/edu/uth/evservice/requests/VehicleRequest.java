package edu.uth.evservice.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;
import edu.uth.evservice.models.enums.VehicleType;
import jakarta.validation.constraints.NotNull;

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
    Integer centerId;

    //@NotNull đảm bảo người dùng không để trống trường này.
    @NotNull(message = "Loại xe không được để trống")
    VehicleType vehicleType;
}
