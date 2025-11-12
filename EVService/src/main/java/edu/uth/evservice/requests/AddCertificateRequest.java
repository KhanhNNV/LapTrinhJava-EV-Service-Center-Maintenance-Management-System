package edu.uth.evservice.requests;

import java.time.LocalDate;

import lombok.Data;

@Data
public class AddCertificateRequest {
    private Integer certificateId;
    private LocalDate issueDate;
    private String credentialId;
    private String notes; // ghi chú
}