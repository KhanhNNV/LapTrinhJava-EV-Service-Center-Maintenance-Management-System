package edu.uth.evservice.EVService.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartDto {
    private Integer partId;
    private String partName;
    private Double unitPrice;
    private Double costPrice;
}
