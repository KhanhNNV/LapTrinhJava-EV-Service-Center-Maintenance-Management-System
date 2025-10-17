package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Table(name = "technicianCertificates")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicianCertificate {
    @EmbeddedId
    TechnicianCertificateId id;

    @ManyToOne
    @JoinColumn(name = "technician_id",nullable = false)
    User technician;

    @ManyToOne
    @JoinColumn(name = "certificate_id", nullable = false)
    Certificate certificate;

    @Column(nullable = false)
    LocalDate issueDate;
    @Column(nullable = false)
    LocalDate expiryDate;

    @Column(unique = true,length = 50, nullable = false)
    String credentialId; // mã chứng thực (tương t mã định danh)

    @Column(nullable = false,length = 100)
    String notes;


}
