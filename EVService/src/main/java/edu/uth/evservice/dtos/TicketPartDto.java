package edu.uth.evservice.dtos;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TicketPartDto {
    private Integer partId;
    private String partName;
    private Integer quantity;
    private Double unitPriceAtTimeOfService;
    private double lineTotal;
}