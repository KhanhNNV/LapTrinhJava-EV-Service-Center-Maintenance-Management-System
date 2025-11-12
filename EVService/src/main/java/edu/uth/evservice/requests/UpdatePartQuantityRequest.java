package edu.uth.evservice.requests;

import lombok.Data;

@Data
public class UpdatePartQuantityRequest {
    private Integer partId;

    // Nếu tech không muó lấy số lượng từ gợi ý có thể đổi
    private int quantity;
}
