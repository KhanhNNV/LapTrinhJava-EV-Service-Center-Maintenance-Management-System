package edu.uth.evservice.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
    LocalDateTime createdAt;
    String role;
    String centerName;
}
