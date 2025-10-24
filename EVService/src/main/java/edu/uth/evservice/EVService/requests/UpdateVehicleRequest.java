package edu.uth.evservice.EVService.requests;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateVehicleRequest {
    // Chỉ chứa các trường nhân viên được phép thay đổi
    private String model;
    private String brand;
    private String licensePlate;

}