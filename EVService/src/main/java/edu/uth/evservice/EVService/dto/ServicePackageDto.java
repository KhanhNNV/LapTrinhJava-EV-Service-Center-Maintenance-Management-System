package edu.uth.evservice.EVService.dto;

import lombok.Data;

@Data
public class ServicePackageDto {
    private Long packageId;
    private String packageName;
    private Double price;
    private Integer duration;
    private String description;
}
