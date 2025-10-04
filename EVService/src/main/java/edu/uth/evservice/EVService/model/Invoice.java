package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "invoice")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer invoiceId;

    private LocalDate invoiceDate;
    private Double totalAmount;
    private String paymentStatus;
    private String paymentMethod;

    private Integer ticketId;   // FK tham chiếu Ticket
    private Integer customerId; // FK tham chiếu Customer
}
