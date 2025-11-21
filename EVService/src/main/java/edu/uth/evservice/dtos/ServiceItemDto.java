package edu.uth.evservice.dtos;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceItemDto {
    Integer id;
    String itemName;
    String description;
    Double price;
}
