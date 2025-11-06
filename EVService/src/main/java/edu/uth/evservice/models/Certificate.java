package edu.uth.evservice.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "certificate_id")
    Integer certificateId;

    @Column(name = "certificate_name", nullable = false)
    String certificateName;

    @Column(name = "issuing_organization", nullable = false)
    String issuingOrganization;

    @Column(name = "description", nullable = false, length = 1000)
    String description;

    @Column(name = "validity_period", nullable = false)
    Integer validityPeriod; // thời hạn (ví dụ 5 năm là 1825)

    @Builder.Default
    @OneToMany(mappedBy = "certificate", cascade = CascadeType.ALL, orphanRemoval = true)
    List<TechnicianCertificate> technicianCertificates = new ArrayList<>();
}
