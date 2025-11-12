package edu.uth.evservice.requests;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryRequest {
    private int quantity;
    private Long minQuantity;
    private Integer partId;
    private Integer centerId;
}