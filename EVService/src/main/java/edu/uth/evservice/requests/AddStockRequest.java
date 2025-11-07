package edu.uth.evservice.requests;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AddStockRequest {
    @Min(1)
    private int quantityToAdd; // Số lượng thêm vào kho
}
