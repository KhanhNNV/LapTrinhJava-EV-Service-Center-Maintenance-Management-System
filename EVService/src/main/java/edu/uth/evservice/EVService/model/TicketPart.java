package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "ticket_parts")
@IdClass(TicketPartId.class)
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketPart {
    @Id
    @ManyToOne
    @JoinColumn(name = "ticketId", referencedColumnName = "ticketId", nullable = false)
    private ServiceTicket ticket;

    @Id
    @ManyToOne
    @JoinColumn(name = "partId", referencedColumnName = "partId", nullable = false)
    private Part part;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double unitPriceAtTimeOfService;
}