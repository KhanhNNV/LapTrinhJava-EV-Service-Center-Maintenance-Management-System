package edu.uth.evservice.EVService.model;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class TicketPartId implements Serializable {
    private Integer ticket; 
    private Integer part;  
}