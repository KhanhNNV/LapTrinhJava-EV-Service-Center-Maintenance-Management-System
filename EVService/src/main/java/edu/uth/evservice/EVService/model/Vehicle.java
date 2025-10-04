package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;

@Entity
@Table(name = "vehicle")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    Integer vehicleId;   // Khóa chính

    @Nationalized
    @Column(name = "model", nullable = false)
    String model;         // Mẫu xe (VD: Camry, Vios...)

    @Nationalized
    @Column(name = "brand", nullable = false)
    String brand;         // Hãng xe (VD: Toyota, Honda...)

    @Column(name = "license_plate", unique = true, nullable = false)
    String licensePlate;  // Biển số xe (duy nhất)

    @Column(name = "recent_maintenance_date")
    LocalDate recentMaintenanceDate;  // Ngày bảo trì gần nhất

    // Khóa ngoại: liên kết đến Customer (nếu có bảng Customer)
    @ManyToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "customer_id")
    Customer customer;
}
