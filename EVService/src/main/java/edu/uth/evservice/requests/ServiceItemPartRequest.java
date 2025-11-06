package edu.uth.evservice.requests;

import lombok.Data;

@Data
public class ServiceItemPartRequest {
    private Integer serviceItemId;
    private Integer partId;
    private Integer quantity;
}
