package edu.uth.evservice.EVService.dto;

import edu.uth.evservice.EVService.model.enums.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Builder
public class UserDto {
    Integer userId;
    String username;
    String fullName;
    String email;
    String phoneNumber;
    String address;
    Role role;
}
