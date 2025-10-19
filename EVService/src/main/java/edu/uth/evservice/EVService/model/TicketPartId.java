package edu.uth.evservice.EVService.model;

import java.io.Serializable;

import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketPartId implements Serializable {
    private Integer ticketId;
    private Integer partId;
}


