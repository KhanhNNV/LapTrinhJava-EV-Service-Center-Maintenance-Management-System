package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
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
    Integer certificateId;

    @Column(nullable = false)
    String certificateName;

    @Column(nullable = false)
    String issuingOrganization;

    @Column(nullable = false,length = 1000)
    String description;

    @Column(nullable = false)
    Integer validityPeriod; // thời hạn (ví dụ 5 năm là 1825)

    @Builder.Default
    @OneToMany(mappedBy = "certificate", cascade = CascadeType.ALL,orphanRemoval = true)
    List<TechnicianCertificate> technicianCertificates = new ArrayList<>();
}
