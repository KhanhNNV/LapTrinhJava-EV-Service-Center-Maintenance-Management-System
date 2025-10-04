package edu.uth.evservice.EVService.requests;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VehicleRequest {
    private String model;
    private String brand;
    private String licensePlate;
    private LocalDate recentMaintenanceDate;
    private Integer customerId;       // ID khách hàng
    private Integer serviceCenterId;  // ID trung tâm dịch vụ
}
