package edu.uth.evservice.EVService.requests;

import lombok.Data;

@Data
public class ServiceItemPartRequest {
    private Long serviceItemId;
    private Long partId;
    private Integer quantity;
}
