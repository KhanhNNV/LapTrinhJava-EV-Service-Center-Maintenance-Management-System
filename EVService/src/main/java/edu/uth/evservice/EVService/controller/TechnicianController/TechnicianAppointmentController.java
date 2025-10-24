package edu.uth.evservice.EVService.controller.TechnicianController;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import edu.uth.evservice.EVService.services.IUserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technician/appointments")
@RequiredArgsConstructor
public class TechnicianAppointmentController {

    private final IServiceTicketService serviceTicketService;
    private final IUserService userService; // service

    /**
     * 3.1.1 Xem danh sách công việc/bảo dưỡng được phân công
     */
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<ServiceTicketDto>> getAssignedServiceTickets(Authentication authentication) {
        User currentTech = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Technician not found with username: " + authentication.getName()));

        // Thay đổi: Gọi phương thức service hiệu quả hơn, không lọc thủ công
        List<ServiceTicketDto> assignedTickets = serviceTicketService.getTicketsByTechnicianId(currentTech.getUserId());

        return ResponseEntity.ok(assignedTickets);
    }

    /**
     * 3.1.2 Xem chi tiết phiếu tiếp nhận dịch vụ (ServiceTicket)
     */
    @GetMapping("/{ticketId}/details")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> getServiceTicketDetails(@PathVariable Integer ticketId,
            Authentication authentication) {
        serviceTicketService.verifyTicketOwnership(ticketId, authentication.getName());

        ServiceTicketDto ticket = serviceTicketService.getTicketById(ticketId);
        return ResponseEntity.ok(ticket);
    }
}