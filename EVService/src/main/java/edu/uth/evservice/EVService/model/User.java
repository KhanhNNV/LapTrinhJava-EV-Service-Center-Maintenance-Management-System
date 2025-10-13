package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;
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

    LocalDate createAt;
    LocalDate updateAt;

    // Ví dụ quan hệ với ServiceCenter (nếu user là nhân viên)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    ServiceCenter center;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    List<Vehicle> vehicles;

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL)
    List<Notification> notifications;
}


