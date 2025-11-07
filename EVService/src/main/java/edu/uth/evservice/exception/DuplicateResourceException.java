package edu.uth.evservice.exception;
//Bắt lỗi  khi username/email đã tồn tại
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
