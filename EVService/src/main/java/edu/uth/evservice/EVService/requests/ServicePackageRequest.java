package edu.uth.evservice.EVService.requests;

import lombok.Data;

@Data
public class ServicePackageRequest {
    private String packageName;
    private Double price;
    private Integer duration;
    private String description;
}
