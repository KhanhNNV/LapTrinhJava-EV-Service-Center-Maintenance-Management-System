package edu.uth.evservice.EVService.requests;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateCustomerRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String password;
}
