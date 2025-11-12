package edu.uth.evservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedPartsDto {
    private TicketServiceItemDto serviceItemAdded;
    private List<ServiceTicketPartDto> suggestedParts;
}
