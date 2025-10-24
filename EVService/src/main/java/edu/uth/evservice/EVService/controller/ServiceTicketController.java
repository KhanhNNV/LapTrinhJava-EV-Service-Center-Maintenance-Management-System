package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API controller cho ServiceTicket
 */
@RestController
@RequestMapping("/api/service-tickets")
@RequiredArgsConstructor
public class ServiceTicketController {

    private final IServiceTicketService ticketService;

//    @GetMapping
//    public ResponseEntity<List<ServiceTicketDto>> getAll() {
//        return ResponseEntity.ok(ticketService.getAllTickets());
//    }
    //Quản lý Hàng chờ
    @GetMapping
    public ResponseEntity<List<ServiceTicketDto>> getAll(@RequestParam(required = false) String status){
        if (status != null && !status.isEmpty()) {
            // 2. Nếu có, gọi service để lọc theo status
            return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
        } else {
            // 3. Nếu không, trả về tất cả như cũ
            return ResponseEntity.ok(ticketService.getAllTickets());
        }
    }
    //@RequestParam(required = false): Báo cho Spring biết rằng tham số status trong URL là không bắt buộc.

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

}
