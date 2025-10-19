
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
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer invoiceId;

    @Column(nullable = false)
    private LocalDate invoiceDate;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String paymentStatus;   // Ví dụ: "Pending", "Paid", "Cancelled"

    @Column(nullable = false)
    private String paymentMethod;   // Ví dụ: "Cash", "Credit Card", "Bank Transfer"

    @OneToOne
    @JoinColumn(name = "ticket_id", nullable = false, unique = true)
    private ServiceTicket serviceTicket;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
}
