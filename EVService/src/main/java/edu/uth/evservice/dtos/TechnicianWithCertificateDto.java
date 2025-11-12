package edu.uth.evservice.dtos;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TechnicianWithCertificateDto {
    private Integer userId;
    private String fullName;
    private String phoneNumber;
    private LocalDate expiryDate;
}
