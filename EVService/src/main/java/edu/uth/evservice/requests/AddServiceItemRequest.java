package edu.uth.evservice.requests;

import lombok.Data;

@Data
public class AddServiceItemRequest {
    // Tech dùng để thêm dịch vụ vào ticket
    private Integer itemId;
    private int quantity;
}
