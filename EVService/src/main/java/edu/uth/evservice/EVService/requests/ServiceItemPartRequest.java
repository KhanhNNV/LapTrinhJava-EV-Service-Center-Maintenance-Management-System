package edu.uth.evservice.EVService.requests;

import lombok.Data;

@Data
public class ServiceItemPartRequest {
    private Integer serviceItemId;
    private Integer partId;
    private Integer quantity;
}
