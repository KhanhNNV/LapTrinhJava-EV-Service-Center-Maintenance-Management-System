package edu.uth.evservice.requests;

import lombok.Data;
import java.util.List;

@Data
public class ServicePackageRequest {
    private String packageName;
    private Double price;
    private Integer duration;
    private String description;

    private List<Integer> serviceItemIds;
}
