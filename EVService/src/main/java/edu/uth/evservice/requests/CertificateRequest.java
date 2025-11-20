package edu.uth.evservice.requests;

import edu.uth.evservice.models.enums.CertificateType;
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
    CertificateType certificateType;
}
