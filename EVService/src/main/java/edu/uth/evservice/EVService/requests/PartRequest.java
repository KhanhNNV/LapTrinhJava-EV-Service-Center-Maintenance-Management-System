package edu.uth.evservice.EVService.requests;

import lombok.Data;

@Data
public class PartRequest {
    private String partName;
    private Double unitPrice;
    private Double costPrice;
}
