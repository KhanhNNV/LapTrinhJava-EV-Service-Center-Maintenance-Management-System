package edu.uth.evservice.dtos;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvoiceDto {
    private Integer invoiceId;
    private LocalDate invoiceDate;
    private Double totalAmount;
    private String paymentStatus;
    private String paymentMethod;
    private Integer ticketId;
    private Integer customerId;
}
