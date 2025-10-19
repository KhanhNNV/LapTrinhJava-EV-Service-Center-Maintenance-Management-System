package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "ticketServiceItems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketServiceItem {

    @EmbeddedId
    @Column(name = "id")
    TicketServiceItemId id;

    @ManyToOne
    @MapsId("ticketId")
    @JoinColumn(name = "ticket_id", nullable = false)
    ServiceTicket serviceTicket;

    @ManyToOne
    @MapsId("itemId")
    @JoinColumn(name = "item_id", nullable = false)
    ServiceItem serviceItem;

    @Column(name = "quantity", nullable = false)
    Integer quantity;

    @Column(name = "unit_price_at_time_of_service", nullable = false)
    Double unitPriceAtTimeOfService;
}
