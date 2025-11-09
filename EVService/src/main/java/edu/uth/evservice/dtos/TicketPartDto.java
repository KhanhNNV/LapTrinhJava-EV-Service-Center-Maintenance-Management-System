package edu.uth.evservice.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class TicketPartDto {
    private Integer partId;
    private String partName;
    private Integer quantity;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "#.00")
    private Double unitPriceAtTimeOfService;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "#.00")
    private double lineTotal;
}