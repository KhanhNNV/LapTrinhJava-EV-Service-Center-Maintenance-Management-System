package edu.uth.evservice.EVService.model.employee;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "employees")
public abstract class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer employeeId;

    private String role;
    private Integer centerId;
    private String username;
    @Nationalized
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
    @Nationalized
    private String address;

    LocalDate createAt;
    LocalDate updateAt;


}
