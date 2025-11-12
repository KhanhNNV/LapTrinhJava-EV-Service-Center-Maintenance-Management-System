package edu.uth.evservice.requests;

import lombok.Data;

@Data
public class AddSuggestedPartRequest {
    // Dùng làm request body khi Admin thêm gợi ý
    private Integer partId;
    private int quantity;
}
