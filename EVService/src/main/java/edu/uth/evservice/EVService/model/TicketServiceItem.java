package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "ticket_service_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketServiceItem {

    @EmbeddedId
    TicketServiceItemId id; // Khóa chính kép

    @ManyToOne
    @MapsId("ticketId")
    @JoinColumn(name = "ticket_id")
    ServiceTicket serviceTicket;

    @ManyToOne
    @MapsId("itemId")
    @JoinColumn(name = "item_id")
    ServiceItem serviceItem;

    Integer quantity;
    Double unitPriceAtTimeOfService;
}
