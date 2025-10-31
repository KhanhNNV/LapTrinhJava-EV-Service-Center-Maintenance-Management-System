package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.dto.TechnicianPerformanceDto;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
    //Báo cáo hiệu suất làm việc của technician
    @GetMapping("/performance")
    public ResponseEntity<List<TechnicianPerformanceDto>> getTechnicianPerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<TechnicianPerformanceDto> report = ticketService.calculateTechnicianPerformance(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}
