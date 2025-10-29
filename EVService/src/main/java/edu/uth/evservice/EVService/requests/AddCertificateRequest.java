package edu.uth.evservice.EVService.requests;

import java.time.LocalDate;

import lombok.Data;

@Data
public class AddCertificateRequest {
    private Integer certificateId;
    private LocalDate issueDate;
    private String credentialId;
}