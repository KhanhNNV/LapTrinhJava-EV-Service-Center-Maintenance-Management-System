package edu.uth.evservice.requests;

import lombok.Data;

@Data
public class ServiceCenterRequest {

    private String centerName;

    private String address;

    private String phoneNumber;

    private String email;
    
}
