package edu.uth.evservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCenterDto {
    private int centerId;
    private String centerName;
    private String address;
    private String phoneNumber;
    private String email;
}