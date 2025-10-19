package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;
import edu.uth.evservice.EVService.model.enums.AppointmentStatus;

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
    @Column(name = "appointment_id")
    Integer appointmentId;

    @Column(name = "appointment_date", nullable = false)
    LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    LocalTime appointmentTime;

    @Column(name = "service_type", nullable = false)
    @Nationalized
    String serviceType;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    AppointmentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", referencedColumnName = "user_id", nullable = false)
    private User customer; // người đặt lịch / chủ xe

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id",referencedColumnName = "user_id", nullable = false)
    private User createdBy; // nhân viên tạo lịch

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    ServiceCenter center;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    ServiceTicket serviceTickets;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "note")
    private String note;

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
}
