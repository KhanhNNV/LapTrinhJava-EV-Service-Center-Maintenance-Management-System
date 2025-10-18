package edu.uth.evservice.EVService.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceItemPartDto{
    private Integer ticketId;
    private Integer itemId;
    private Integer partId;
    private Integer quantity;
    private Double unitPriceAtTimeOfService;
}
