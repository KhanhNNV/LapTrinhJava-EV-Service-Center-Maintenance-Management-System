package edu.uth.evservice.requests;

import lombok.Data;

@Data
public class AddPartRequest {
    // Tech dùng để thêm phụ tùng vào ticket
    private Integer partId;
    private int quantity;
}
