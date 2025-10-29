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
import edu.uth.evservice.EVService.model.enums.ServiceTicketStatus;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technician/maintenance")
@RequiredArgsConstructor
public class TechnicianMaintenanceController {

    private final IServiceTicketService ticketService;

    /**
     * THÊM MỚI: KTV bắt đầu công việc trên một ticket.
     * Tương đương "check-in" cho công việc, đặt trạng thái là IN_PROGRESS.
     */
    // @PutMapping("/{ticketId}/start")
    // @PreAuthorize("hasRole('TECHNICIAN')")
    // public ResponseEntity<ServiceTicketDto> startWork(@PathVariable Integer
    // ticketId, Authentication authentication) {
    // ServiceTicketDto updatedTicket = ticketService.startWorkOnTicket(ticketId,
    // authentication.getName());
    // return ResponseEntity.ok(updatedTicket);
    // }

    /**
     * THÊM MỚI: KTV hoàn thành công việc trên một ticket.
     * Tương đương "check-out" cho công việc, đặt trạng thái là COMPLETED.
     */
    @PutMapping("/{ticketId}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> completeWork(@PathVariable Integer ticketId,
            Authentication authentication) {
        ServiceTicketDto updatedTicket = ticketService.completeWorkOnTicket(ticketId, authentication.getName());
        return ResponseEntity.ok(updatedTicket);
    }

    /**
     * Cập nhật tiến độ bảo dưỡng (ví dụ: ON_HOLD, CANCELLED).
     */
    @PutMapping("/{ticketId}/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> updateMaintenanceStatus(
            @PathVariable Integer ticketId,
            @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        // TỐI ƯU HÓA: Chỉ cần gọi một phương thức service duy nhất.
        ServiceTicketStatus newStatus = ServiceTicketStatus.valueOf(request.getStatus().toUpperCase());
        ServiceTicketDto updatedTicket = ticketService.updateTicketStatus(ticketId, authentication.getName(),
                newStatus);

        return ResponseEntity.ok(updatedTicket);
    }

    /**
     * Ghi nhận tình trạng xe trong quá trình bảo dưỡng.
     */
    @PutMapping("/{ticketId}/notes")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> recordVehicleCondition(
            @PathVariable Integer ticketId,
            @RequestBody NotesUpdateRequest request,
            Authentication authentication) {

        // TỐI ƯU HÓA: Chỉ cần gọi một phương thức service duy nhất.
        ServiceTicketDto updatedTicket = ticketService.updateTicketNotes(ticketId, authentication.getName(),
                request.getNotes());

        return ResponseEntity.ok(updatedTicket);
    }

    @Data
    static class StatusUpdateRequest {
        private String status;
    }

    @Data
    static class NotesUpdateRequest {
        private String notes;
    }
}