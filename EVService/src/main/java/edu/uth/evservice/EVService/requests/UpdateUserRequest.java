package edu.uth.evservice.EVService.requests;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {
    // Các trường nhân viên có thể cập nhật
    private String fullName;
    private String phoneNumber;
    private String address;
}