package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Column(nullable = false)
    @Nationalized
    String fullName;

    @Column(nullable = false, unique = true)
    String email;

    @Column(nullable = false)
    String password;

    @Column(length = 15)
    String phoneNumber;

    @Column(nullable = false)
    @Nationalized
    String address;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    Role role;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    ServiceCenter serviceCenter;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<Vehicle> vehicles = new ArrayList<>();;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<Notification> notifications = new ArrayList<>();;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<CustomerPackageContract>  customerPackageContracts = new ArrayList<>();;

    //customer đặt lịch
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> customerAppointments = new ArrayList<>();;

    //staff đặt lịch
    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appointment> createdAppointments = new ArrayList<>();;

    @OneToMany(mappedBy = "customerConversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> customerConversations = new ArrayList<>();

    @OneToMany(mappedBy = "staffConversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> staffConversations = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServicePackage> servicePackages = new ArrayList<>();

    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TechnicianCertificate> technicianCertificates = new ArrayList<>();

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


