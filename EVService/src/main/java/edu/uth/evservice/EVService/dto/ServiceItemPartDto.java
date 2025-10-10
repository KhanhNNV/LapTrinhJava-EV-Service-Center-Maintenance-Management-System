package edu.uth.evservice.EVService.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceItemPartDto{
    private Integer id;
    private Integer serviceItemId;
    private Integer partId;
    private Integer quantity;
}
