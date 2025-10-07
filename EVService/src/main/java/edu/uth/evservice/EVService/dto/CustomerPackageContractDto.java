package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerPackageContractDto {
    private Integer contractId;
    private Integer customerId;
    private String customerName;
    private Integer packageId;//Đã thêm thằng ServicePackage
    private String packageName;//Đã thêm thằng ServicePackage
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
}