package edu.uth.evservice.EVService.requests;

import edu.uth.evservice.EVService.model.Role;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateUserRequest {
    String username;
    String fullName;
    String email;
    String phoneNumber;
    String address;
    String password;
    Role role;
    Integer centerId;
}
