package edu.uth.evservice.dtos;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TechnicianCertificateDto {
    private Integer technicianId;
    private Integer certificateId;
    private String certificateName;
    private String issuingOrganization;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String credentialId;
}