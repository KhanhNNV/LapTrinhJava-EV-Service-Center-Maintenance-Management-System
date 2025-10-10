package edu.uth.evservice.EVService.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceItemDto {
    Integer id;
    String itemName;
    String description;
    Double price;
}
