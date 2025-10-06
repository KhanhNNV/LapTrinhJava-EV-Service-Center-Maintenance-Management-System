package edu.uth.evservice.EVService.respones;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * VehicleResponse là lớp DTO dùng để trả dữ liệu Vehicle cho client.
 * Nó bao gồm thông tin cơ bản về xe, khách hàng và trung tâm dịch vụ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {

    private Integer vehicleId;              // ID xe
    private String model;                   // Model xe
    private String brand;                   // Thương hiệu
    private String licensePlate;            // Biển số
    private LocalDate recentMaintenanceDate; // Ngày bảo dưỡng gần nhất

    private Integer customerId;             // ID khách hàng
    private String customerName;            // Tên khách hàng

    private Integer serviceCenterId;        // ID trung tâm dịch vụ
    private String serviceCenterName;       // Tên trung tâm dịch vụ
}
