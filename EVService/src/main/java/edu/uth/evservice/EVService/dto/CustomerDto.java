package edu.uth.evservice.EVService.dto;

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
public class CustomerDto {
    private Integer id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
}
