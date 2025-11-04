package edu.uth.evservice.requests;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketPartRequest {
    private Integer ticketId;
    private Integer partId;
    private Integer quantity;
    private Double unitPriceAtTimeOfService;
}