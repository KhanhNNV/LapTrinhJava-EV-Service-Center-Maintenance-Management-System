package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
// import jakarta.persistence.criteria.CriteriaBuilder;
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
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer customerId;

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
