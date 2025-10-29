package edu.uth.evservice.EVService.controller.TechnicianController;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.EVService.dto.AppointmentDto;
import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.services.IAppointmentService;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import edu.uth.evservice.EVService.services.IUserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technician/appointments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TECHNICIAN')")
public class TechnicianAppointmentController {

    private final IAppointmentService appointmentService;
    private final IUserService userService;
    private final IServiceTicketService ticketService;

    /**
     * Bước 3: KTV xem danh sách LỊCH HẸN (chưa phải công việc) đã được gán cho
     * mình.
     */
    @GetMapping("/assigned")
    public ResponseEntity<List<AppointmentDto>> getAssignedAppointments(Authentication authentication) {
        User currentTech = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Technician not found with username: " + authentication.getName()));
        List<AppointmentDto> appointments = appointmentService
                .getConfirmedAppointmentsForTechnician(currentTech.getUserId());
        return ResponseEntity.ok(appointments);
    }

    /**
     * Bước 5: KTV NHẤN NÚT "TẠO PHIẾU DỊCH VỤ" SAU KHI KHÁCH ĐÃ CHECK-IN.
     * Đây là hành động bắt đầu công việc thực sự.
     */
    @PostMapping("/{appointmentId}/create-service-ticket")
    public ResponseEntity<ServiceTicketDto> createServiceTicketFromAppointment(
            @PathVariable Integer appointmentId,
            Authentication authentication) {

        ServiceTicketDto newTicket = ticketService.createTicketFromAppointment(appointmentId, authentication.getName());
        return new ResponseEntity<>(newTicket, HttpStatus.CREATED);
    }

}