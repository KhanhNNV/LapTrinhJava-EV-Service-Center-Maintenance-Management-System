package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerProfileDto {
    Integer userId;
    String fullName;
    String email;
    String phoneNumber;
    String address;
    List<VehicleDto> vehicles;
}
