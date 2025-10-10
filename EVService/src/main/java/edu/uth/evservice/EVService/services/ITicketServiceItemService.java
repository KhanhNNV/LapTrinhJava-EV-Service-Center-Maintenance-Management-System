package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.TicketServiceItemDto;
import edu.uth.evservice.EVService.requests.CreateTicketServiceItemRequest;

import java.util.List;

public interface ITicketServiceItemService {
    List<TicketServiceItemDto> getAllTicketServiceItems();
    TicketServiceItemDto getTicketServiceItemById(Integer ticketId, Integer itemId);
    TicketServiceItemDto createTicketServiceItem(CreateTicketServiceItemRequest request);
    TicketServiceItemDto updateTicketServiceItem(CreateTicketServiceItemRequest request);
    void deleteTicketServiceItem(Integer ticketId, Integer itemId);
}
