package edu.uth.evservice.exception;
//Bắt lỗi user không tồn tại
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
