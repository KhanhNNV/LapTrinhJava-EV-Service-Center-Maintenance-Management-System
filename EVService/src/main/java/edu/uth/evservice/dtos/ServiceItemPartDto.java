package edu.uth.evservice.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceItemPartDto{
    private Integer serviceItemId;
    private Integer partId;
    private Integer quantity;
}
