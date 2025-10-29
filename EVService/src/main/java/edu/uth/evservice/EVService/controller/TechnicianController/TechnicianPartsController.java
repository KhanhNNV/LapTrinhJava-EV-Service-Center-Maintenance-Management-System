package edu.uth.evservice.EVService.controller.TechnicianController;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.TicketPartDto;
import edu.uth.evservice.EVService.requests.TicketPartRequest;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import edu.uth.evservice.EVService.services.ITicketPartService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technician/parts")
@RequiredArgsConstructor
public class TechnicianPartsController {

    private final ITicketPartService ticketPartService;
    private final IServiceTicketService ticketService;

    /**
     * 2.3.1 & 2.3.2 Đề xuất và ghi nhận phụ tùng đã sử dụng cho một ticket
     */
    @PostMapping("/ticket/{ticketId}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TicketPartDto> addPartToTicket(
            @PathVariable Integer ticketId,
            @RequestBody TicketPartRequest partRequest,
            Authentication authentication) {

        // Logic kiểm tra quyền sở hữu ticket trước khi thêm phụ tùng là chính xác.
        ticketService.verifyTicketOwnership(ticketId, authentication.getName());

        partRequest.setTicketId(ticketId);
        TicketPartDto addedPart = ticketPartService.createTicketPart(partRequest);
        return ResponseEntity.ok(addedPart);
    }
}