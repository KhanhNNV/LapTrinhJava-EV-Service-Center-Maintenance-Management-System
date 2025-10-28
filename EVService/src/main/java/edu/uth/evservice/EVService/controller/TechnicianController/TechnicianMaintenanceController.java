package edu.uth.evservice.EVService.controller.TechnicianController;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technician/maintenance")
@RequiredArgsConstructor
public class TechnicianMaintenanceController {

    private final IServiceTicketService ticketService;

    /**
     * 3.2.1 Cập nhật tiến độ bảo dưỡng của xe: chờ – đang làm – hoàn tất.
     */
    @PutMapping("/{ticketId}/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> updateMaintenanceStatus(
            @PathVariable Integer ticketId,
            @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        ticketService.verifyTicketOwnership(ticketId, authentication.getName());

        ServiceTicketDto currentTicket = ticketService.getTicketById(ticketId);

        ServiceTicketRequest updateRequest = ServiceTicketRequest.builder()
                .status(request.getStatus())
                .startTime(currentTicket.getStartTime())
                .endTime(currentTicket.getEndTime())
                .notes(currentTicket.getNotes())
                .appointmentId(currentTicket.getAppointmentId())
                .technicianId(currentTicket.getTechnicianId())
                .build();

        return ResponseEntity.ok(ticketService.updateTicket(ticketId, updateRequest));
    }

    /**
     * 3.2.2 Ghi nhận tình trạng xe trong quá trình bảo dưỡng.
     */
    @PutMapping("/{ticketId}/notes")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> recordVehicleCondition(
            @PathVariable Integer ticketId,
            @RequestBody NotesUpdateRequest request,
            Authentication authentication) {

        ticketService.verifyTicketOwnership(ticketId, authentication.getName());

        ServiceTicketDto currentTicket = ticketService.getTicketById(ticketId);

        ServiceTicketRequest updateRequest = ServiceTicketRequest.builder()
                .notes(request.getNotes())
                .status(currentTicket.getStatus())
                .startTime(currentTicket.getStartTime())
                .endTime(currentTicket.getEndTime())
                .appointmentId(currentTicket.getAppointmentId())
                .technicianId(currentTicket.getTechnicianId())
                .build();

        return ResponseEntity.ok(ticketService.updateTicket(ticketId, updateRequest));
    }

    // DTOs nội bộ cho request body
    @Data
    static class StatusUpdateRequest {
        private String status;
    }

    @Data
    static class NotesUpdateRequest {
        private String notes;
    }
}