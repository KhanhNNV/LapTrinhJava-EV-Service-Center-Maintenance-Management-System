package edu.uth.evservice.dtos;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketServiceItemDto {
    Integer ticketId;
    Integer itemId;
    Integer quantity;
    Double unitPriceAtTimeOfService;
}
