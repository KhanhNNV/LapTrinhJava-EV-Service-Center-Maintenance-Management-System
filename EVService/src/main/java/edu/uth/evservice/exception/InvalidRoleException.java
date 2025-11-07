package edu.uth.evservice.exception;
//Bắt lỗi khi role không phù hợp
public class InvalidRoleException extends RuntimeException {
    public InvalidRoleException(String message) {
        super(message);
    }
}
