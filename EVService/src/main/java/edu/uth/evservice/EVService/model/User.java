package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer userId;

    @Column(nullable = false, unique = true)
    String username;

    @Nationalized
    String fullName;

    @Column(nullable = false, unique = true)
    String email;

    String password;

    @Column(length = 15)
    String phoneNumber;

    @Nationalized
    String address;

    @Enumerated(EnumType.STRING)
    Role role;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    ServiceCenter serviceCenter;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<Vehicle> vehicles;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<Notification> notifications;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<CustomerPackageContract>  customerPackageContracts;

    //customer đặt lịch
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> customerAppointments;

    //staff đặt lịch
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> createdAppointments;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


