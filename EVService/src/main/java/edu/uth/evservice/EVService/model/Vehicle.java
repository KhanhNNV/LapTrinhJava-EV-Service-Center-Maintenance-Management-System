package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;
import edu.uth.evservice.EVService.model.enums.VehicleType;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
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

    //@Enumerated(EnumType.STRING) lưu tên (vd: "ELECTRIC_CAR")
    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false)
    VehicleType vehicleType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    private ServiceCenter serviceCenter;

    @Builder.Default
    @OneToMany(mappedBy = "vehicle",cascade = CascadeType.ALL)
    List<Appointment> appointments = new ArrayList<>();

}
