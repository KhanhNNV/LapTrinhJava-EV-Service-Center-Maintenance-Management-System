package edu.uth.evservice.requests;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class AddStockRequest {
    private Integer partId;

    private Integer centerId;

    @Min(1)
    private int quantityToAdd;

}
