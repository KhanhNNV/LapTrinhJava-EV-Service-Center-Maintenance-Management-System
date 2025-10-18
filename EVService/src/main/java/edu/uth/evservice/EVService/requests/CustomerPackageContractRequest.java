package edu.uth.evservice.EVService.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerPackageContractRequest {
    private Integer userId;
    private Integer packageId;
    private LocalDate startDate;
    private String status;
}