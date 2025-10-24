package edu.uth.evservice.EVService.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder //  Để dùng hàm .builder() ở RecordCostContrller.java
@NoArgsConstructor  // Hai này để hổ trợ trên hoạt động tốt
@AllArgsConstructor
public class CreateInvoiceRequest {
    private LocalDate invoiceDate;
    private Double totalAmount;
    private String paymentStatus;
    private String paymentMethod;
    private Integer ticketId;
    private Integer userId;
}
