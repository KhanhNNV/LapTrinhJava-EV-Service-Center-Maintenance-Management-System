package edu.uth.evservice.EVService.dto;

import edu.uth.evservice.EVService.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UserDto {
    Integer id;
    String username;
    String fullName;
    String email;
    String phoneNumber;
    String address;
    Role role;
}
