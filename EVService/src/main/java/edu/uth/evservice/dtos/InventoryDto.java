package edu.uth.evservice.dtos;

import java.time.LocalDate;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class InventoryDto {
    private Integer inventoryId;
    private int quantity;
    private Long minQuantity;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    private Integer partId;
    private String partName;
    private Integer centerId;
    private String centerName;
}