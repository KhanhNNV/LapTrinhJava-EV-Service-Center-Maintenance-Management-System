package edu.uth.evservice.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateTicketServiceItemRequest {
    Integer ticketId;
    Integer itemId;
    Integer quantity;
    Double unitPriceAtTimeOfService;
}
