package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer appointmentId;

    @Column(nullable = false)
    LocalDate appointmentDate;

    @Column(nullable = false)
    LocalTime appointmentTime;

    @Column(nullable = false)
    @Nationalized
    String serviceType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    AppointmentStatus status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer; // người đặt lịch / chủ xe

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdBy_id", nullable = false)
    private User createdBy; // nhân viên tạo lịch


    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    ServiceCenter center;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = AppointmentStatus.PENDING; // mặc định là chờ xác nhận
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AppointmentStatus {
        PENDING,
        CONFIRMED,
        CANCELED,
        COMPLETED
    }

}
