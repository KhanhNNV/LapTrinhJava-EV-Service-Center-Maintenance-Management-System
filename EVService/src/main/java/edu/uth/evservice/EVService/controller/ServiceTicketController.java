package edu.uth.evservice.EVService.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import lombok.RequiredArgsConstructor;

/**
 * REST API controller cho ServiceTicket
 */
@RestController
@RequestMapping("/api/service-tickets")
@RequiredArgsConstructor
public class ServiceTicketController {

    private final IServiceTicketService ticketService;

    @GetMapping
    public ResponseEntity<List<ServiceTicketDto>> getAll() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceTicketDto> getById(@PathVariable int id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceTicketDto> create(@RequestBody ServiceTicketRequest request) {
        ServiceTicketDto dto = ticketService.createTicket(request);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceTicketDto> update(@PathVariable int id, @RequestBody ServiceTicketRequest request) {
        ServiceTicketDto dto = ticketService.updateTicket(id, request);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok().build();
    }

    // Tao service ticket tu appointment cua technician
    @PostMapping("/technician/{appointmentId}/create-service-ticket")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> createServiceTicket(
            @PathVariable Integer appointmentId,
            Authentication authentication) {

        ServiceTicketDto newTicket = ticketService.createTicketFromAppointment(appointmentId, authentication.getName());
        return new ResponseEntity<>(newTicket, HttpStatus.CREATED);
    }

    // cap nhat trang thai service ticket khi hoan thanh cong viec
    @PutMapping("/technician/{ticketId}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> completeWork(@PathVariable Integer ticketId,
            Authentication authentication) {
        ServiceTicketDto updatedTicket = ticketService.completeWorkOnTicket(ticketId, authentication.getName());
        return ResponseEntity.ok(updatedTicket);
    }
}
