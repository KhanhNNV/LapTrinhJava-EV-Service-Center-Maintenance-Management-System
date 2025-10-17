package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateDto {
    Integer certificateId;
    String certificateName;
    String issuingOrganization;
    String description;
    Integer validityPeriod;
}
