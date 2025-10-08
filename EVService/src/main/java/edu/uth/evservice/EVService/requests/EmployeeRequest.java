package edu.uth.evservice.EVService.requests;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeRequest {
    private String fullName;
    private String username;
    private String email;
    private String phoneNumber;
    private String address;
    private String password;
    private String role;
    private Integer centerId;
}
