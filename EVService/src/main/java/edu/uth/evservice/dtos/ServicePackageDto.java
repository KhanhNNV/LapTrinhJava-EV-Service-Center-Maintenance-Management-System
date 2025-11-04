package edu.uth.evservice.dtos;

import lombok.AllArgsConstructor; 
import lombok.Builder;        
import lombok.Data;
import lombok.NoArgsConstructor; 

@Data
@NoArgsConstructor    
@AllArgsConstructor   
@Builder             
public class ServicePackageDto {
    private Integer packageId;
    private String packageName;
    private Double price;
    private Integer duration;
    private String description;
}
