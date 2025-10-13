package edu.uth.evservice.EVService.services;

import java.util.List;

import edu.uth.evservice.EVService.dto.TicketPartDto;
import edu.uth.evservice.EVService.requests.TicketPartRequest;

public interface ITicketPartService {
    List<TicketPartDto> getAllTicketParts();

    TicketPartDto getTicketPartById(Integer ticketId, Integer partId);

    TicketPartDto createTicketPart(TicketPartRequest request);

    TicketPartDto updateTicketPart(Integer ticketId, Integer partId, TicketPartRequest request);

    void deleteTicketPart(Integer ticketId, Integer partId);

    List<TicketPartDto> getTicketPartsByTicketId(Integer ticketId);

    List<TicketPartDto> getTicketPartsByPartId(Integer partId);
}