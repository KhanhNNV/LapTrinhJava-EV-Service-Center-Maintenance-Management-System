package edu.uth.evservice.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateInvoiceRequest {
    private LocalDate invoiceDate;
    private Double totalAmount;
    private String paymentStatus;
    private String paymentMethod;
    private Integer ticketId;
    private Integer userId;
}
