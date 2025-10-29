package edu.uth.evservice.EVService.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.hibernate.annotations.Nationalized;

import edu.uth.evservice.EVService.model.enums.AppointmentStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

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

    @Column(name = "status", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    AppointmentStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", referencedColumnName = "user_id", nullable = false)
    private User customer; // người đặt lịch / chủ xe

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", referencedColumnName = "user_id", nullable = false)
    private User createdBy; // nhân viên tạo lịch

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", referencedColumnName = "user_id") // Nullable vì ban đầu chưa gán
    private User assignedTechnician;

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
