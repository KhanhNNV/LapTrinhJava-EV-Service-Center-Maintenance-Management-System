package edu.uth.evservice.dtos;

import edu.uth.evservice.models.Invoice;
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
    private Integer packageId;
    private String packageName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Integer invoiceId;
}