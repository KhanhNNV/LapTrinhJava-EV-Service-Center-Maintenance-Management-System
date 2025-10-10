package edu.uth.evservice.EVService.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.TicketPartDto;
import edu.uth.evservice.EVService.requests.TicketPartRequest;
import edu.uth.evservice.EVService.services.ITicketPartService;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/ticket_parts")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@CrossOrigin(origins = "http://localhost:3000")
public class TicketPartController {
    private final ITicketPartService ticketPartService;

    @GetMapping
    public List<TicketPartDto> getAllTicketParts() {
        return ticketPartService.getAllTicketParts();
    }

    @GetMapping("/{ticketId}/{partId}")
    public TicketPartDto getTicketPartById(
            @PathVariable Integer ticketId,
            @PathVariable Integer partId) {
        return ticketPartService.getTicketPartById(ticketId, partId);
    }

    @PostMapping
    public TicketPartDto createTicketPart(@Validated @RequestBody TicketPartRequest request) {
        return ticketPartService.createTicketPart(request);
    }

    @PutMapping("/{ticketId}/{partId}")
    public TicketPartDto updateTicketPart(
            @PathVariable Integer ticketId,
            @PathVariable Integer partId,
            @Validated @RequestBody TicketPartRequest request) {
        return ticketPartService.updateTicketPart(ticketId, partId, request);
    }

    @DeleteMapping("/{ticketId}/{partId}")
    public void deleteTicketPart(
            @PathVariable Integer ticketId,
            @PathVariable Integer partId) {
        ticketPartService.deleteTicketPart(ticketId, partId);
    }

    @GetMapping("/ticket/{ticketId}")
    public List<TicketPartDto> getTicketPartsByTicketId(@RequestParam Integer ticketId) {
        return ticketPartService.getTicketPartsByTicketId(ticketId);
    }

    @GetMapping("/part/{partId}")
    public List<TicketPartDto> getTicketPartsByPartId(@RequestParam Integer partId) {
        return ticketPartService.getTicketPartsByPartId(partId);
    }
}