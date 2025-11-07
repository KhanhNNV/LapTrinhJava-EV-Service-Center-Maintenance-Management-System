package edu.uth.evservice.requests.jwt;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username; 
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    //! Role sẽ mặc định là CUSTOMER trong AuthController
}


//. VIỆC TẠO RA FILE NÀY MẶC DÙ ĐÃ CÓ THẰNG CreateUserRequest.java
//~ Thằng autherController chỉ dành riêng cho member tự đăng ký nên 
//~ do đó,API này không được phép cho member gửi lên role hay centerId,
//~ NÊN (RegisterRequest) NÀY CHỈ chứa thông tin cần thiết cho vieecjc này
//~ Sau này khi tạo chức năng cho đăng kí,tạo tài khoản cho các STAFF, TECHICAN thì ta có thể sử dụng thằng CreateUserRequest