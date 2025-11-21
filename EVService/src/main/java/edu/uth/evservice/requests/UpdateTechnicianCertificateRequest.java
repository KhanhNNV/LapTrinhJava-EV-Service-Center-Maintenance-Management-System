package edu.uth.evservice.requests;

import java.time.LocalDate;

import lombok.Data;

@Data
public class UpdateTechnicianCertificateRequest {
    private LocalDate issueDate;
    private String credentialId;
    private String notes;
}
