package edu.uth.evservice.dtos;

import edu.uth.evservice.models.enums.Role;
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
