package edu.uth.evservice.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.dtos.TicketServiceItemDto;
import edu.uth.evservice.requests.CreateTicketServiceItemRequest;
import edu.uth.evservice.services.ITicketServiceItemService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/ticket-service-items")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketServiceItemController {

    ITicketServiceItemService ticketServiceItemService;

    @GetMapping
    public List<TicketServiceItemDto> getAllTicketServiceItems() {
        return ticketServiceItemService.getAllTicketServiceItems();
    }

    @GetMapping("/{ticketId}/{itemId}")
    public TicketServiceItemDto getTicketServiceItemById(@PathVariable Integer ticketId, @PathVariable Integer itemId) {
        return ticketServiceItemService.getTicketServiceItemById(ticketId, itemId);
    }

    @PostMapping
    public TicketServiceItemDto createTicketServiceItem(@RequestBody CreateTicketServiceItemRequest request) {
        return ticketServiceItemService.createTicketServiceItem(request);
    }

    @PutMapping
    public TicketServiceItemDto updateTicketServiceItem(@RequestBody CreateTicketServiceItemRequest request) {
        return ticketServiceItemService.updateTicketServiceItem(request);
    }

    @DeleteMapping("/{ticketId}/{itemId}")
    public void deleteTicketServiceItem(@PathVariable Integer ticketId, @PathVariable Integer itemId) {
        ticketServiceItemService.deleteTicketServiceItem(ticketId, itemId);
    }
}
