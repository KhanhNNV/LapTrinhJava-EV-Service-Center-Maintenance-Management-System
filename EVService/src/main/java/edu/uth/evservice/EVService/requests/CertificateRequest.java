package edu.uth.evservice.EVService.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateRequest {
    String certificateName;
    String issuingOrganization;
    String description;
    Integer validityPeriod;
}
