package edu.uth.evservice.dtos;

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
    ///
}
