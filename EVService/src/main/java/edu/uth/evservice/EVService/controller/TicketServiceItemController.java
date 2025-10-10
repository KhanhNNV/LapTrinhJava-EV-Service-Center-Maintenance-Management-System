package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.TicketServiceItemDto;
import edu.uth.evservice.EVService.requests.CreateTicketServiceItemRequest;
import edu.uth.evservice.EVService.services.ITicketServiceItemService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ticket-service-items")
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
