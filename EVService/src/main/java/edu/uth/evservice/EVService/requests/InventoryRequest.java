package edu.uth.evservice.EVService.requests;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryRequest {
    long quantity;
    long min_quantity;
    Integer part_id;
    Integer center_id;
}