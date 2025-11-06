package edu.uth.evservice.dtos;

import java.time.LocalDate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryDto {
    private Integer inventoryId;
    private Long quantity;
    private Long minQuantity;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    private Integer partId;
    private String partName;
    private Integer centerId;
    private String centerName;
}