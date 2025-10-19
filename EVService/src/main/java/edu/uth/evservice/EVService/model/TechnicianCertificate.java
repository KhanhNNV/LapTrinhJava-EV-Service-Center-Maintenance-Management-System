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
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TechnicianCertificate {

    @EmbeddedId
    TechnicianCertificateId id;

    @ManyToOne
    @MapsId("technicianId")
    @JoinColumn(name = "technician_id", referencedColumnName = "user_id", nullable = false)
    User technician;

    @ManyToOne
    @MapsId("certificateId")
    @JoinColumn(name = "certificate_id", nullable = false)
    Certificate certificate;

    @Column(name = "issue_date", nullable = false)
    LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    LocalDate expiryDate;

    @Column(name = "credential_id", unique = true, length = 50, nullable = false)
    String credentialId;

    @Column(name = "notes", nullable = false, length = 100)
    String notes;
}
