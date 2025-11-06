package edu.uth.evservice.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "ticketParts")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketPart {

    @EmbeddedId
    TicketPartId id;

    @ManyToOne
    @MapsId("ticketId")
    @JoinColumn(name = "ticket_id", nullable = false)
    ServiceTicket ticket;

    @ManyToOne
    @MapsId("partId")
    @JoinColumn(name = "part_id", nullable = false)
    Part part;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "unit_price_at_time_of_service", nullable = false)
    Double unitPriceAtTimeOfService;
}
