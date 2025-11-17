package edu.uth.evservice.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;
import edu.uth.evservice.models.enums.Role;
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
    @Column(name = "user_id")
    Integer userId;

    @Column(name = "username", nullable = false, unique = true)
    String username;

    @Nationalized
    @Column(name = "full_name", nullable = true)
    String fullName;

    @Column(name = "email", nullable = true, unique = true)
    String email;

    @Column(name = "password", nullable = false)
    String password;

    @Column(name = "phone_number", length = 15, unique = true)
    String phoneNumber;

    @Nationalized
    @Column(name = "address")
    String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    Role role;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = false; // mặc định chưa kích hoạt

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    ServiceCenter serviceCenter;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Vehicle> vehicles = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<CustomerPackageContract> customerPackageContracts = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Appointment> customerAppointments = new ArrayList<>();

    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Appointment> createdAppointments = new ArrayList<>();

    @OneToMany(mappedBy = "customerConversation", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Conversation> customerConversations = new ArrayList<>();

    @OneToMany(mappedBy = "staffConversation", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Conversation> staffConversations = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL, orphanRemoval = true)
    List<TechnicianCertificate> technicianCertificates = new ArrayList<>();

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
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
