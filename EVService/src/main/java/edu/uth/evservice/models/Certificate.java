package edu.uth.evservice.models;

import java.util.ArrayList;
import java.util.List;

import edu.uth.evservice.models.enums.CertificateType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "certificate_type", nullable = false)
    private CertificateType certificateType;

    @Builder.Default
    @OneToMany(mappedBy = "certificate", cascade = CascadeType.ALL, orphanRemoval = true)
    List<TechnicianCertificate> technicianCertificates = new ArrayList<>();
}
