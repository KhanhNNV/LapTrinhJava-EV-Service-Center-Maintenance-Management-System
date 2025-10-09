package edu.uth.evservice.EVService.requests;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryRequest {
    private long quantity;
    private long minQuantity;
    private Integer partId;
    private Integer centerId;
}